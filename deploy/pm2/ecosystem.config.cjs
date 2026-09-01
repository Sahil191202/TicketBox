/**
 * PM2 process file for TicketBox API + public web.
 * Run from Backend/ after .env is configured on the server:
 *
 *   cd /home/ubuntu/ticketbox/Backend
 *   pm2 start ../deploy/pm2/ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup
 */
module.exports = {
  apps: [
    {
      name: 'ticketbox-api',
      cwd: __dirname + '/../../Backend',
      script: 'src/api.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'ticketbox-web',
      cwd: __dirname + '/../../Backend',
      script: 'src/web.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
