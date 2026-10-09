import path from "node:path";
import nodeMailer from "nodemailer";
import config from "../config";

const transporter = nodeMailer.createTransport({
	service: "gmail",
	auth: {
		type: "OAuth2",
		user: config.email_sender,
		clientId: config.google_client_id,
		clientSecret: config.google_client_secret,
		refreshToken: config.google_refresh_token,
	},
});

export const brandLogoAttachment = {
	filename: "brand-logo.png",
	path: path.resolve(process.cwd(), "public", "brand-logo.png"),
	cid: "brand-logo",
};

export default transporter;
