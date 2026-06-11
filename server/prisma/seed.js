const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

const employeeList = [
  { srNo: 1, pfNumber: "10025", uan: "101823878948", tic: "1817064190", name: "ASHISH CHOKARE", designation: "STAFF" },
  { srNo: 2, pfNumber: "10020", uan: "101433374374", tic: "1817647313", name: "DHARMENDRA KALAM", designation: "STAFF" },
  { srNo: 3, pfNumber: "10021", uan: "101718653560", tic: "1816721127", name: "ROHIT", designation: "STAFF" },
  { srNo: 4, pfNumber: "10006", uan: "101200181176", tic: "1817224754", name: "MANGILAL AMODE (SURESH)", designation: "STAFF" },
  { srNo: 5, pfNumber: "10005", uan: "101178531310", tic: "1817224777", name: "VAIBHAV SINGH PANWAR", designation: "STAFF" },
  { srNo: 6, pfNumber: "10012", uan: "101622203153", tic: "1817026792", name: "PAWAN BHUVANTA", designation: "STAFF" },
  { srNo: 7, pfNumber: "10003", uan: "101597514885", tic: "1816623226", name: "RAJKUMAR PRAJAPAT", designation: "STAFF" },
  { srNo: 8, pfNumber: "10014", uan: "101945435802", tic: "1816924190", name: "SUNIL PATEL", designation: "STAFF" },
  { srNo: 9, pfNumber: "10019", uan: "101842032992", tic: null, name: "MAHESH", designation: "WORKER" },
  { srNo: 10, pfNumber: "10016", uan: "101945436225", tic: "1816985824", name: "SANDEEP VERMA", designation: "STAFF" },
  { srNo: 11, pfNumber: null, uan: null, tic: null, name: "DILIP KANASIYA", designation: "WORKER" },
  { srNo: 12, pfNumber: null, uan: null, tic: null, name: "KAMAL", designation: "WORKER" },
  { srNo: 13, pfNumber: "10013", uan: "101945435792", tic: null, name: "SHIVNATH PAWAR", designation: "STAFF" },
  { srNo: 14, pfNumber: "10026", uan: "102059421248", tic: null, name: "RIYA GUPTA", designation: "STAFF" },
  { srNo: 15, pfNumber: "10007", uan: "101945435744", tic: "1816759090", name: "ANWAR KHILJI", designation: "STAFF" },
  { srNo: 16, pfNumber: "10011", uan: "101945435785", tic: null, name: "SURESH PRAJAPAT", designation: "STAFF" },
  { srNo: 17, pfNumber: "10004", uan: "100346141809", tic: null, name: "SHAILESH NAMDEV", designation: "STAFF" },
  { srNo: 18, pfNumber: "10009", uan: "101945435763", tic: null, name: "DHARM GOUTAM", designation: "STAFF" },
  { srNo: 19, pfNumber: "10008", uan: "101945435759", tic: null, name: "HUSAIN MILLWALA", designation: "STAFF" },
  { srNo: 20, pfNumber: null, uan: null, tic: null, name: "ALI MOHD KHAN", designation: "WORKER" },
  { srNo: 21, pfNumber: null, uan: null, tic: null, name: "BABAN S/O GHEESALAL", designation: "WORKER" },
  { srNo: 22, pfNumber: null, uan: null, tic: null, name: "DEEPAK MORYA", designation: "WORKER" },
  { srNo: 23, pfNumber: null, uan: null, tic: null, name: "DILIP YADAV", designation: "WORKER" },
  { srNo: 24, pfNumber: null, uan: null, tic: null, name: "FAKHIRA YADAV", designation: "WORKER" },
  { srNo: 25, pfNumber: null, uan: null, tic: null, name: "GOPAL PAWAR", designation: "WORKER" },
  { srNo: 26, pfNumber: null, uan: null, tic: null, name: "GOURAV MORYA", designation: "WORKER" },
  { srNo: 27, pfNumber: null, uan: null, tic: null, name: "GOVIND NIGAM", designation: "WORKER" },
  { srNo: 28, pfNumber: null, uan: null, tic: null, name: "GOVIND SINGH (SANWER)", designation: "WORKER" },
  { srNo: 29, pfNumber: null, uan: null, tic: null, name: "GOVIND SOLANKI-78", designation: "WORKER" },
  { srNo: 30, pfNumber: null, uan: null, tic: null, name: "KALYAN", designation: "WORKER" },
  { srNo: 31, pfNumber: null, uan: null, tic: null, name: "NANNU SINGH", designation: "WORKER" },
  { srNo: 32, pfNumber: null, uan: null, tic: null, name: "SARFUDDIN", designation: "WORKER" },
  { srNo: 33, pfNumber: null, uan: null, tic: null, name: "SEETARAM", designation: "WORKER" },
  { srNo: 34, pfNumber: null, uan: null, tic: null, name: "PINTU DAVAR", designation: "WORKER" },
  { srNo: 35, pfNumber: null, uan: null, tic: null, name: "MANGILAL BARDE", designation: "WORKER" },
  { srNo: 36, pfNumber: null, uan: null, tic: null, name: "VIRENDRA SINGH", designation: "WORKER" },
  { srNo: 37, pfNumber: null, uan: null, tic: null, name: "NARAYAN WASKEL", designation: "WORKER" },
  { srNo: 38, pfNumber: null, uan: null, tic: null, name: "KISAN BARDE", designation: "WORKER" },
  { srNo: 39, pfNumber: "10010", uan: "101945435771", tic: null, name: "UDIT NAGJI", designation: "STAFF" },
  { srNo: 40, pfNumber: "10002", uan: "100028273953", tic: null, name: "VISHNU PRAJAPAT", designation: "STAFF" },
  { srNo: 41, pfNumber: "10015", uan: "101945436218", tic: null, name: "DHARM SISODIA", designation: "STAFF" },
  { srNo: 42, pfNumber: null, uan: null, tic: "1818571726", name: "SONIYA SOLANKI", designation: "STAFF" },
  { srNo: 43, pfNumber: null, uan: null, tic: null, name: "MONA SHETH", designation: "DIRECTOR" },
  { srNo: 44, pfNumber: null, uan: null, tic: null, name: "DARSHAN SHETH", designation: "DIRECTOR" },
  { srNo: 45, pfNumber: null, uan: null, tic: null, name: "VIVEK SHETH", designation: "DIRECTOR" },
  { srNo: 46, pfNumber: null, uan: null, tic: null, name: "RUPEN SHETH", designation: "DIRECTOR" },
  { srNo: 47, pfNumber: "10027", uan: "102175191008", tic: "1818346620", name: "ROSHAN", designation: "STAFF" },
  { srNo: 48, pfNumber: "10028", uan: "101640839902", tic: "1818852514", name: "SUNIL", designation: "STAFF" }
];

async function main() {
  console.log("Starting seeding process...");

  // Seed Admin
  const adminUsername = process.env.ADMIN_USERNAME || "dharmendra";
  const adminEmail = process.env.ADMIN_EMAIL || "dharmendra@viveksteel.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@1234";

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { username: adminUsername },
    update: {
      email: adminEmail,
      password: hashedPassword
    },
    create: {
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword
    }
  });
  console.log(`Admin user '${admin.username}' created or updated.`);

  // Seed Employees
  for (const emp of employeeList) {
    await prisma.employee.upsert({
      where: { id: emp.srNo }, // We map id to srNo for seeded employees
      update: {
        srNo: emp.srNo,
        pfNumber: emp.pfNumber,
        uan: emp.uan,
        tic: emp.tic,
        name: emp.name,
        designation: emp.designation,
        isActive: true
      },
      create: {
        id: emp.srNo,
        srNo: emp.srNo,
        pfNumber: emp.pfNumber,
        uan: emp.uan,
        tic: emp.tic,
        name: emp.name,
        designation: emp.designation,
        isActive: true
      }
    });
  }

  console.log("✅ Seeded admin and 48 employees successfully");
}

main()
  .catch((e) => {
    console.error("Error during seeding: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
