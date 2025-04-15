package services

import (
	"fmt"
	"net/smtp"
)

type EmailService struct {
	auth smtp.Auth
	host string
	addr string
	from string
}

func NewEmailService(username, password string) EmailService {
	smtpHost := "smtp.mailtrap.io"
	smtpPort := "2525"
	auth := smtp.PlainAuth("", username, password, smtpHost)
	return EmailService{
		auth: auth,
		host: smtpHost,
		addr: smtpHost + ":" + smtpPort,
		from: "no-reply@patientapp.com",
	}
}

func (es EmailService) SendConfirmation(toEmail, patientName string) error {
	subject := "Patient Registration Confirmation"
	body := fmt.Sprintf("Hello %s,\n\nThank you for registering as a patient. Your information has been received.\n\nRegards,\nPatient App Team", patientName)
	msg := "From: " + es.from + "\r\n" +
		"To: " + toEmail + "\r\n" +
		"Subject: " + subject + "\r\n\r\n" +
		body
	return smtp.SendMail(es.addr, es.auth, es.from, []string{toEmail}, []byte(msg))
}
