const cron = require('node-cron');
const prisma = require('../config/db');
const logger = require('./logger');
const { subDays, startOfDay } = require('date-fns');

const startCronJobs = () => {
  // Run every day at midnight: '0 0 * * *'
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running midnight cron job to backfill absent records...');
    try {
      // Calculate yesterday's date
      const yesterday = startOfDay(subDays(new Date(), 1));
      
      // Get all active employees
      const activeEmployees = await prisma.employee.findMany({
        where: { isActive: true }
      });

      let count = 0;
      for (const emp of activeEmployees) {
        // Check if attendance record exists for yesterday
        const existing = await prisma.attendance.findUnique({
          where: {
            employeeId_date: {
              employeeId: emp.id,
              date: yesterday
            }
          }
        });

        // If no record exists, create an ABSENT record
        if (!existing) {
          await prisma.attendance.create({
            data: {
              employeeId: emp.id,
              date: yesterday,
              status: 'ABSENT',
              notes: 'Auto-marked as ABSENT by system cron'
            }
          });
          count++;
        }
      }

      logger.info(`Cron job finished. Marked ${count} employees as ABSENT for date: ${yesterday.toISOString().split('T')[0]}`);
    } catch (err) {
      logger.error('Error running midnight cron job:', err);
    }
  });
};

module.exports = { startCronJobs };
