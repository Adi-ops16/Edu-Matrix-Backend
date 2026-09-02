import type {
	Providers,
	Role,
	UserStatus,
} from "../../../../generated/prisma/enums";

export interface IUser {
	name: string;
	email: string;
	password: string | null;
	id: string;
	google_id: string | null;
	profile_url: string | null;
	profile_public_id: string | null;
	role: Role | null;
	provider: Providers;
	user_status: UserStatus;
	is_active: boolean;
	is_deleted: boolean;
	is_verified: boolean;
	institutionId: number | null;
	created_at: Date;
	updated_at: Date;
}
