

import { IUserService, IFileService, IAdminService, INotificationService } from './interfaces.ts';
import { SupabaseUserService } from './supabaseUserService.ts';
import { SupabaseFileService } from './supabaseFileService.ts';
import { SupabaseAdminService } from './supabaseAdminService.ts';
import { SupabaseNotificationService } from './supabaseNotificationService.ts';

// 1. Importando o serviço que você criou com o nome correto
import { SupabaseAppService } from './supabaseAppService.tsx';

export const appService = SupabaseAppService;
export const userService: IUserService = SupabaseUserService;
export const fileService: IFileService = SupabaseFileService;
export const adminService: IAdminService = SupabaseAdminService;
export const notificationService: INotificationService = SupabaseNotificationService;