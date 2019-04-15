# ClockIn

ClockIn is a simple time tracking app for freelancers (and employees, if you like).

## Hosting

To host this yourself, you will need to have Docker and Docker Compose installed. You will also need to create a .env
file containing various configuration options (KEY=value):

 - DATA_DIR: Path to a directory to store runtime data. Can be relative or absolute.
 - DOMAIN: The root domain name to host the project on. If running locally, it's fine to use a domain such as
   clockin.localhost. When running on localhost, a self-signed certificate will be generated.
 - UPDATE_TOKEN: A secret token to use when automatically deploying from a GitHub repository. Unless you are forking
   the project, you can probably ignore this.
 - MAILGUN_KEY: API key for sending email through Mailgun.
 - MAILGUN_DOMAIN: The Mailgun domain to send from, as displayed in the control panel (e.g. mg.mydomain.com).

Once you've done that, simply run `docker-compose up -d` and navigate to `DOMAIN`. If hosting locally, you will need to
tell your browser to accept the self-signed certificate.
