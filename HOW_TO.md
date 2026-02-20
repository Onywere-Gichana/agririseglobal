# How To: Setup and Run the Blog Post Website

This guide will walk you through setting up and running the blog post website. Follow these steps in order.

## Prerequisites

Before you begin, make sure you have the following installed:
- **Node.js** (v16 or higher) and npm
- **Docker** and Docker Compose (for PostgreSQL database)
- A code editor (optional, but recommended)

## Step 1: Database Setup

The project uses PostgreSQL for storing data. We'll run it using Docker for easy setup.

### Start PostgreSQL Database

Open a terminal in the project root directory (`blog-post-website`) and run:

```bash
docker compose up -d
```

This will start a PostgreSQL database container. You can verify it's running with:

```bash
docker ps
```

You should see a container named `blog-post-db` running.

**Database Details:**
- **Host:** localhost
- **Port:** 5432
- **Database:** blog_db
- **Username:** postgres
- **Password:** postgres

> **Note:** The database tables (`users` and `posts`) will be created automatically when you start the backend server for the first time.

### Stop Database (when needed)

To stop the database:

```bash
docker compose down
```

## Step 2: Backend Setup

### Configure Environment Variables

1. Navigate to the `server` folder:
   ```bash
   cd server
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Open the `.env` file in a text editor. You'll see something like this:

   ```ini
   PORT=5000
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/blog_db
   JWT_SECRET=change_this_to_a_long_random_string
   CLIENT_URL=http://localhost:5173
   WP_SITE_URL=https://your-wordpress-site.com
   WP_USERNAME=<your_user_name>
   WP_APP_PASSWORD=<your_app_password>
   ```

4. **IMPORTANT:** Update the following values:

   - **JWT_SECRET:** Replace `change_this_to_a_long_random_string` with a long, random string (at least 32 characters). This is used to secure authentication tokens. You can generate one using:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   
   - **WP_SITE_URL:** Replace `https://your-wordpress-site.com` with your actual WordPress site URL (e.g., `https://example.com`). **Leave this blank if you're not using WordPress sync.**
   
   - **WP_USERNAME:** Replace `<your_user_name>` with your WordPress username. **Leave this blank if you're not using WordPress sync.**
   
   - **WP_APP_PASSWORD:** Replace `<your_app_password>` with your WordPress Application Password. **Leave this blank if you're not using WordPress sync.**
   
   > **Note:** The `DATABASE_URL` is already configured correctly for the Docker setup. Only change it if you're using a different database configuration.

### Install Dependencies and Start Backend

1. Install backend dependencies:
   ```bash
   npm install
   ```

2. Start the backend server:
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

3. You should see:
   ```
   Database tables initialized successfully
   Server running on http://localhost:5000
   ```

   The backend API is now running at `http://localhost:5000`.

## Step 3: Frontend Setup

Open a **new terminal window** (keep the backend running) and navigate to the frontend folder:

### Install Dependencies and Start Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

4. You should see:
   ```
   VITE v5.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

   The frontend is now running at `http://localhost:5173`.

## Step 4: Create Your Admin Account

1. Open your web browser and go to: `http://localhost:5173/admin/register`

2. Fill in the registration form:
   - **Name:** Your full name
   - **Email:** Your email address (this will be your login email)
   - **Password:** Choose a strong password

3. Click "Register" to create your admin account.

   > **Important:** Only **one admin account** can be created through the registration page. After the first admin is created, this page will no longer allow new admin registrations. Additional users must be created by an admin through the dashboard.

4. After successful registration, you'll be redirected to the login page.

## Step 5: Log In and Access Dashboard

1. Go to: `http://localhost:5173/admin/login`

2. Enter your email and password that you just created.

3. After logging in, you'll be redirected to the dashboard at `/admin/dashboard`.

   From the dashboard, you can:
   - Create new blog posts
   - Edit existing posts
   - View all posts (published and drafts)
   - Create user accounts (admin only)
   - Sync posts from WordPress (if configured)

## Step 6: WordPress Sync Setup (Optional)

If you want to sync posts from a WordPress site:

### Get WordPress Application Password

1. Log in to your WordPress admin dashboard.

2. Go to **Users** → **Profile** (or **Users** → **Your Profile**).

3. Scroll down to the **Application Passwords** section.

4. Enter a name for the application (e.g., "Blog Sync") and click **Add New Application Password**.

5. WordPress will generate an application password. **Copy this password immediately** (you won't be able to see it again).

6. Update your `server/.env` file with:
   - **WP_SITE_URL:** Your WordPress site URL (e.g., `https://example.com`)
   - **WP_USERNAME:** Your WordPress username
   - **WP_APP_PASSWORD:** The application password you just generated

7. Restart your backend server for the changes to take effect.

### Sync Posts from WordPress

1. Log in to the dashboard.

2. Click **WordPress Sync** in the dashboard navigation.

3. Click **Sync from WordPress** button.

4. The system will fetch published posts from your WordPress site and add them to the database as drafts.

5. You can then edit and publish these posts from the dashboard.

## Step 7: Creating Blog Posts

1. From the dashboard, click **New Post**.

2. Fill in the post details:
   - **Title:** The post title
   - **Content:** The post content (supports HTML)
   - **Category:** Select a category (Farming Products, Education, Crop Management, Livestock, Sustainable Farming, or General)
   - **Featured Image URL:** (Optional) URL to an image
   - **Status:** Choose "Published" to make it visible immediately, or "Draft" to save for later

3. Click **Create Post**.

4. Your post will appear on the blog page and homepage (if published).

## Creating Additional User Accounts (Admin Only)

As an admin, you can create accounts for authors:

1. From the dashboard, click **Create User**.

2. Fill in:
   - **Name:** Author's name
   - **Email:** Author's email
   - **Password:** You can enter a password or click "Generate secure password"

3. Click **Create User**.

4. The system will display the credentials. **Share these securely with the author** so they can log in.

5. Authors can log in and create posts, but cannot create other users or access WordPress sync.

## Running the Application

### Development Mode

1. **Terminal 1:** Start the database (if not already running):
   ```bash
   docker compose up -d
   ```

2. **Terminal 2:** Start the backend:
   ```bash
   cd server
   npm run dev
   ```

3. **Terminal 3:** Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

### Production Mode

For production deployment:

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. The built files will be in `frontend/dist/`. Serve these files using a web server (nginx, Apache, or a Node.js server like `serve`).

3. Set `NODE_ENV=production` in your backend `.env` file.

4. Start the backend:
   ```bash
   cd server
   npm start
   ```

## Troubleshooting

### Database Connection Issues

- **Error:** "Cannot connect to database"
  - **Solution:** Make sure Docker is running and the database container is up (`docker ps`). Try restarting: `docker compose down && docker compose up -d`

### Backend Won't Start

- **Error:** "DATABASE_URL is not set"
  - **Solution:** Make sure you've created `server/.env` from `server/.env.example` and it contains `DATABASE_URL`

- **Error:** "Port 5000 already in use"
  - **Solution:** Change `PORT` in `server/.env` to a different port (e.g., `5001`)

### Frontend Can't Connect to Backend

- **Error:** "Cannot connect to server"
  - **Solution:** Make sure the backend is running on port 5000. Check `server/.env` for the correct `PORT` value.

### WordPress Sync Fails

- **Error:** "WordPress authentication failed"
  - **Solution:** Double-check `WP_USERNAME` and `WP_APP_PASSWORD` in `server/.env`. Make sure you're using an Application Password, not your regular WordPress password.

- **Error:** "Cannot connect to WordPress site"
  - **Solution:** Verify `WP_SITE_URL` is correct and your WordPress site is accessible. Make sure the WordPress REST API is enabled.

### Login Issues

- **Error:** "Invalid credentials"
  - **Solution:** Make sure you're using the correct email and password. If you forgot your password, you'll need to reset it directly in the database or create a new admin account (if none exists).

## File Structure

```
blog-post-website/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service functions
│   │   └── context/       # React context (auth)
│   └── public/           # Static assets
├── server/               # Express backend API
│   ├── config/          # Database and initialization
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth and admin middleware
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts
│   └── .env            # ⚠️ Environment variables (create from .env.example)
├── images/              # Hero carousel images
├── icon                 # Logo image
├── docker-compose.yml   # Docker database configuration
├── HOW_TO.md           # This file
└── README.md           # Project overview
```

## Important Notes

1. **Security:** Never commit your `.env` file to version control. It contains sensitive information like database credentials and JWT secrets.

2. **Database:** The database data persists in a Docker volume. If you run `docker compose down -v`, you'll lose all data. Use this carefully.

3. **Admin Account:** Only one admin account can be created via the registration page. After that, only admins can create new user accounts.

4. **WordPress Sync:** WordPress sync is optional. You can use the website without WordPress by simply leaving the WordPress credentials blank in `.env`.

5. **Categories:** Posts can be categorized as:
   - Farming Products
   - Education
   - Crop Management
   - Livestock
   - Sustainable Farming
   - General

## Support

If you encounter any issues not covered in this guide:

1. Check the console logs in your browser (F12 → Console) for frontend errors.
2. Check the terminal where the backend is running for server errors.
3. Verify all environment variables are set correctly in `server/.env`.
4. Ensure Docker and the database are running properly.

---

**You're all set!** The website should now be running and ready to use. Happy blogging! 🌾
