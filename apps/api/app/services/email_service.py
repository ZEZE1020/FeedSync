import smtplib
from email.message import EmailMessage

def send_email(to_address: str, subject: str, body: str):
    """Sends an email using a mock SMTP server."""
    # In a real application, you would use a real SMTP server
    # and get the credentials from a secure location.
    smtp_server = "localhost"
    smtp_port = 1025  # Default port for a local mock SMTP server
    from_address = "noreply@feedsync.com"

    msg = EmailMessage()
    msg.set_content(body)
    msg["Subject"] = subject
    msg["From"] = from_address
    msg["To"] = to_address

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.send_message(msg)
        print(f"Email sent to {to_address}")
    except Exception as e:
        print(f"Failed to send email: {e}")