import smtplib
import socket
import ssl
import sys

import mailer


def explain(error):
    if isinstance(error, smtplib.SMTPAuthenticationError):
        return ("The server rejected the user or the password.\n"
                "  - SMTP_USER must be the full email address.\n"
                "  - Gmail does NOT accept your normal password: turn on 2-step verification and create an\n"
                "    'app password' at https://myaccount.google.com/apppasswords, then use that one.")
    if isinstance(error, smtplib.SMTPNotSupportedError):
        return "The server does not support that option. Try SMTP_STARTTLS=0 (and check the port)."
    if isinstance(error, (smtplib.SMTPSenderRefused, smtplib.SMTPRecipientsRefused)):
        return ("The server refused the sender or the recipient.\n"
                "  - Set MAIL_FROM to the same address as SMTP_USER.\n"
                "  - Check that the recipient address is written correctly.")
    if isinstance(error, ssl.SSLError):
        return ("The secure connection failed. Port 587 uses STARTTLS (SMTP_STARTTLS=1);\n"
                "port 465 needs SSL from the start (SMTP_SSL=1).")
    if isinstance(error, (ConnectionError, TimeoutError, socket.gaierror)):
        return ("Could not reach the mail server.\n"
                "  - Check SMTP_HOST and SMTP_PORT (Gmail: smtp.gmail.com and 587).\n"
                "  - Check your internet connection; some networks, VPNs or firewalls block the mail ports.")
    return "Unexpected error. Read the message above; it comes from the mail server."


def main():
    if len(sys.argv) != 2 or "@" not in sys.argv[1]:
        print("Usage: python test_email.py your.address@example.com")
        return 1
    recipient = sys.argv[1]

    if not mailer.is_configured():
        print("SMTP_HOST is not set in this terminal, so the app would NOT send emails.\n"
              "Set the variables first, for example (Gmail):\n"
              "  export SMTP_HOST=smtp.gmail.com\n"
              "  export SMTP_USER=you@gmail.com\n"
              "  export SMTP_PASSWORD=\"your-app-password\"\n"
              "  export MAIL_FROM=\"PawStore <you@gmail.com>\"")
        return 1

    settings = mailer.smtp_settings()
    mode = "SSL" if settings["ssl"] else ("STARTTLS" if settings["starttls"] else "no encryption")
    password_info = f"set ({len(settings['password'])} characters)" if settings["password"] else "NOT set"
    print(f"Server: {settings['host']}:{settings['port']} ({mode})")
    print(f"User: {settings['user'] or 'NOT set'} | Password: {password_info} | From: {settings['sender']}")
    print(f"Sending a test email to {recipient} ...")

    try:
        mailer.send_email(recipient, "PawStore - prueba de correo",
                          "Si estás leyendo esto, la configuración del correo funciona.\n\nPawStore")
    except Exception as error:
        print(f"\nFAILED: {error!r}\n{explain(error)}")
        return 1

    print(f"\nOK: the server accepted the message. Check the inbox of {recipient} (and the spam folder).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
