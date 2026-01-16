import { IUserService, IFileService, IAdminService, INotificationService, IQualityService, IPartnerService } from './interfaces.ts';
import { SupabaseUserService } from './supabaseUserService.ts';
import { SupabaseFileService } from './supabaseFileService.ts';
import { SupabaseAdminService } from './supabaseAdminService.ts';
import { SupabaseNotificationService } from './supabaseNotificationService.ts';
import { SupabaseQualityService } from './supabaseQualityService.ts';
import { SupabasePartnerService } from './supabasePartnerService.ts';

export const userService: IUserService = SupabaseUserService;
export const fileService: IFileService = SupabaseFileService;
export const adminService: IAdminService = SupabaseAdminService;
export const notificationService: INotificationService = SupabaseNotificationService;
export const qualityService: IQualityService = SupabaseQualityService;
export const partnerService: IPartnerService = SupabasePartnerService;