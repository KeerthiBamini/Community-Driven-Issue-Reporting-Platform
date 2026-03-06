// maintenance.js - middleware to enable maintenance mode
const maintenanceMode = (req, res, next) => {
    // You can toggle maintenance mode here
    const isMaintenance = true; // set to false to disable maintenance

    if (isMaintenance) {
        // Send a friendly maintenance page or JSON
        res.status(503).send(`
            <html>
                <head>
                    <title>Maintenance</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f2f2f2;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                        }
                        .container {
                            text-align: center;
                        }
                        h1 {
                            color: #ff4c4c;
                        }
                        p {
                            color: #333;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🚧 We'll be back soon!</h1>
                        <p>Our site is currently under maintenance. Please check back later.</p>
                    </div>
                </body>
            </html>
        `);
    } else {
        // If not in maintenance, continue to next middleware/route
        next();
    }
};

module.exports = maintenanceMode;