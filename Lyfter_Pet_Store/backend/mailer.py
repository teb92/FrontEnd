import os
import smtplib
from email.message import EmailMessage


def is_configured():
    return bool(os.environ.get("SMTP_HOST"))


def smtp_settings():
    host = os.environ.get("SMTP_HOST", "")
    port = int(os.environ.get("SMTP_PORT", "587"))
    password = os.environ.get("SMTP_PASSWORD", "")

    if "gmail" in host.lower():
        password = password.replace(" ", "")

    return {
        "host": host,
        "port": port,
        "user": os.environ.get("SMTP_USER", ""),
        "password": password,
        "ssl": os.environ.get("SMTP_SSL") == "1" or port == 465,
        "starttls": os.environ.get("SMTP_STARTTLS", "1") == "1",
        "sender": os.environ.get("MAIL_FROM", "PawStore <no-reply@pawstore.com>"),
    }


def send_email(to_email, subject, body):
    settings = smtp_settings()

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings["sender"]
    message["To"] = to_email
    message.set_content(body)

    if settings["ssl"]:
        server = smtplib.SMTP_SSL(settings["host"], settings["port"], timeout=10)
    else:
        server = smtplib.SMTP(settings["host"], settings["port"], timeout=10)

    with server:
        if not settings["ssl"] and settings["starttls"]:
            server.starttls()
        if settings["user"]:
            server.login(settings["user"], settings["password"])
        server.send_message(message)
