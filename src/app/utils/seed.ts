import config from "../config";
import { prisma } from "../lib/prisma";
import { hashPassword } from "./hashPassword";

const seedSuperAdmin = async () => {
	const isSuperAdminExists = await prisma.user.findFirst({
		where: { role: "SUPER_ADMIN" },
	});

	if (isSuperAdminExists) {
		return console.log("Super admin exists");
	}
	const hashedPassword = await hashPassword(config.super_admin_password);

	await prisma.user.create({
		data: {
			name: config.super_admin_name,
			email: config.super_admin_email,
			is_verified: true,
			role: "SUPER_ADMIN",
			password: hashedPassword,
		},
	});

	return console.log("Super admin created");
};

export { seedSuperAdmin };
