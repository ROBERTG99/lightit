package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"backend/models"
	"backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var nameRegex = regexp.MustCompile(`^[A-Za-z\s]+$`)

func CreatePatient(db *gorm.DB, emailService services.EmailService) gin.HandlerFunc {
	return func(c *gin.Context) {
		fullName := c.PostForm("fullName")
		email := c.PostForm("email")
		phoneCountry := c.PostForm("phoneCountry")
		phoneNumber := c.PostForm("phoneNumber")

		if !nameRegex.MatchString(fullName) || len(fullName) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Full name must contain letters and spaces only."})
			return
		}

		if !strings.HasSuffix(strings.ToLower(email), "@gmail.com") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email must be a @gmail.com address."})
			return
		}

		if phoneCountry == "" || phoneNumber == "" ||
			!regexp.MustCompile(`^\+?\d+$`).MatchString(phoneCountry) ||
			!regexp.MustCompile(`^\d+$`).MatchString(phoneNumber) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Phone country code and number must be numeric."})
			return
		}

		var existing models.Patient
		if err := db.Where("email = ?", strings.ToLower(email)).First(&existing).Error; err == nil {

			c.JSON(http.StatusBadRequest, gin.H{"error": "This email is already registered."})
			return
		} else if err != gorm.ErrRecordNotFound {

			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error checking email."})
			return
		}

		fileHeader, err := c.FormFile("photo")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Document photo is required."})
			return
		}

		filename := fileHeader.Filename
		if strings.ToLower(filepath.Ext(filename)) != ".jpg" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Only .jpg photos are accepted."})
			return
		}

		_ = os.Mkdir("./uploads", os.ModePerm)

		uniqueName := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filename)
		savePath := filepath.Join("./uploads", uniqueName)
		if err := c.SaveUploadedFile(fileHeader, savePath); err != nil {
			fmt.Printf("Error in SaveUploadedFile: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save photo."})
			return
		}

		newPatient := models.Patient{
			FullName:      fullName,
			Email:         strings.ToLower(email),
			PhoneCountry:  phoneCountry,
			PhoneNumber:   phoneNumber,
			PhotoFilename: uniqueName,
		}
		if err := db.Create(&newPatient).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save patient to database."})
			return
		}

		go func(p models.Patient) {
			if err := emailService.SendConfirmation(p.Email, p.FullName); err != nil {

				fmt.Printf("Error sending confirmation email: %v\n", err)
			}
		}(newPatient)

		c.JSON(http.StatusCreated, gin.H{
			"message": "Patient registered successfully.",
			"patient": gin.H{
				"id":           newPatient.ID,
				"fullName":     newPatient.FullName,
				"email":        newPatient.Email,
				"phoneCountry": newPatient.PhoneCountry,
				"phoneNumber":  newPatient.PhoneNumber,
				"photoURL":     "/uploads/" + newPatient.PhotoFilename,
			},
		})
	}
}

func GetPatients(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var patients []models.Patient
		if err := db.Find(&patients).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve patients."})
			return
		}

		var result []gin.H
		for _, p := range patients {
			result = append(result, gin.H{
				"id":           p.ID,
				"fullName":     p.FullName,
				"email":        p.Email,
				"phoneCountry": p.PhoneCountry,
				"phoneNumber":  p.PhoneNumber,
				"photoURL":     "http://localhost:8080/uploads/" + p.PhotoFilename,
			})
		}
		c.JSON(http.StatusOK, result)
	}
}
