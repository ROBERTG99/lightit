package models

import (
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Patient struct {
	ID            uint      `gorm:"primaryKey"`
	FullName      string    `gorm:"not null"`
	Email         string    `gorm:"not null;uniqueIndex"`
	PhoneCountry  string    `gorm:"not null"`
	PhoneNumber   string    `gorm:"not null"`
	PhotoFilename string    `gorm:"not null"`
	CreatedAt     time.Time `gorm:"autoCreateTime"`
}

func InitDB(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	if err := db.AutoMigrate(&Patient{}); err != nil {
		return nil, err
	}
	return db, nil
}
