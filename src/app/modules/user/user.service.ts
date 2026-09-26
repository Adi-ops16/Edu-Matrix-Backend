import status from "http-status";
import type { Role } from "../../../../generated/prisma/enums";
import { cloudinary } from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/appError";
import uploadImage from "../../utils/uploadImage";

const changePfP = async (picture: Express.Multer.File, user: Express.User) => {
	const existingUser = await prisma.user.findUnique({
		where: { id: user.id },
	});

	if (!existingUser) {
		throw new AppError(status.NOT_FOUND, "User not found");
	}

	const pictureDetails = await uploadImage(picture.buffer, {
		folder: "profile/avatar",
	});
	const photo_url = pictureDetails?.secure_url as string;
	const public_id = pictureDetails?.public_id as string;
	const oldPublicId = existingUser.profile_public_id;

	await prisma.user.update({
		where: { id: user.id },
		data: {
			profile_url: photo_url,
			profile_public_id: public_id,
		},
	});

	if (oldPublicId) {
		await cloudinary.uploader.destroy(oldPublicId);
	}

	return photo_url;
};

const getMyProfile = async (userId: string, role: Role) => {
	const userProfile = await prisma.user.findUnique({
		where: { id: userId },
		include: {
			teacher: role === "TEACHER",
			student: role === "STUDENT",
		},
	});

	if (!userProfile) {
		throw new AppError(status.NOT_FOUND, "User profile not found");
	}

	return userProfile;
};

export const UserService = { changePfP, getMyProfile };
