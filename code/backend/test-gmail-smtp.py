#!/usr/bin/env python3
from email.message import EmailMessage
from pathlib import Path
import smtplib
import ssl
import sys

ENV_PATH = Path(__file__).resolve().parent / ".env"


def load_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def clean_app_password(value: str) -> str:
    return "".join(ch for ch in value if ch.isalnum())


def main() -> int:
    env = load_env(ENV_PATH)
    username = env.get("GMAIL_USERNAME", "").strip()
    password = clean_app_password(env.get("GMAIL_APP_PASSWORD", ""))
    mail_from = env.get("MAIL_FROM", username).strip() or username
    mail_to = sys.argv[1].strip() if len(sys.argv) > 1 else username

    print(f"ENV file: {ENV_PATH}")
    print(f"GMAIL_USERNAME present: {bool(username)} length={len(username)}")
    print(f"MAIL_FROM present: {bool(mail_from)} length={len(mail_from)}")
    print(f"GMAIL_APP_PASSWORD present: {bool(password)} length={len(password)}")
    print(f"Sending test email to: {mail_to}")

    if not username or "@" not in username:
        print("ERROR: GMAIL_USERNAME must be full Gmail address, e.g. name@gmail.com")
        return 1
    if len(password) != 16:
        print("ERROR: GMAIL_APP_PASSWORD should be 16 letters/numbers after removing spaces")
        return 1

    msg = EmailMessage()
    msg["From"] = mail_from
    msg["To"] = mail_to
    msg["Subject"] = "MediCore Gmail SMTP test"
    msg.set_content("Nếu bạn nhận được email này thì Gmail SMTP config đã đúng.")

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=20) as smtp:
            smtp.ehlo()
            smtp.starttls(context=context)
            smtp.ehlo()
            smtp.login(username, password)
            smtp.send_message(msg)
        print("SUCCESS: Gmail SMTP sent test email.")
        return 0
    except Exception as exc:
        print(f"FAILED: {type(exc).__name__}: {exc}")
        print("Check: Gmail 2FA enabled, App Password newly created, username is same Gmail account, no spaces in password.")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
