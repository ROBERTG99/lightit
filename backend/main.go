package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"backend/handlers"
	"backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"backend/models"
)

func main() {

	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASS")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")

	dsn := "host=" + dbHost + " user=" + dbUser + " password=" + dbPass +
		" dbname=" + dbName + " port=" + dbPort + " sslmode=disable"
	db, err := models.InitDB(dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	router := gin.Default()

	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	router.Static("/uploads", "./uploads")

	// Routes
	router.GET("/api/patients", handlers.GetPatients(db))
	router.POST("/api/patients", handlers.CreatePatient(db, services.NewEmailService(smtpUser, smtpPass)))

	seedDB(db)

	log.Println("Server running on http://localhost:8080 ...")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}

func seedDB(db *gorm.DB) {
	var count int64
	db.Model(&models.Patient{}).Count(&count)
	if count == 0 {
		patients := []models.Patient{
			{
				FullName:      "John Doe",
				Email:         "john.doe@gmail.com",
				PhoneCountry:  "+1",
				PhoneNumber:   "5551234",
				PhotoFilename: "example1.jpg",
			},
			{
				FullName:      "Jane Smith",
				Email:         "jane.smith@gmail.com",
				PhoneCountry:  "+44",
				PhoneNumber:   "7700123456",
				PhotoFilename: "example2.jpg",
			},
		}
		if err := db.Create(&patients).Error; err != nil {
			fmt.Printf("Error seeding example patients: %v\n", err)
		} else {
			fmt.Println("Seeded DB with example patients.")
		}
	}
}
