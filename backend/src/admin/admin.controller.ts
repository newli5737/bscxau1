import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  getUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getUsers(Number(page) || 1, Number(limit) || 20);
  }

  @Patch('users/:id/referral-code')
  updateReferralCode(@Param('id', ParseIntPipe) id: number, @Body('referralCode') referralCode: string) {
    return this.adminService.updateUserReferralCode(id, referralCode);
  }

  @Get('referral-tree/:userId')
  getReferralTree(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminService.getReferralTree(userId);
  }

  @Get('products')
  getProducts() {
    return this.adminService.getProducts();
  }

  @Post('products')
  createProduct(@Body() data: any) {
    return this.adminService.createProduct(data);
  }

  @Patch('products/:id')
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.adminService.updateProduct(id, data);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteProduct(id);
  }

  @Get('tasks')
  getTasks() {
    return this.adminService.getTasks();
  }

  @Post('tasks')
  createTask(@Body() data: any) {
    return this.adminService.createTask(data);
  }

  @Patch('tasks/:id')
  updateTask(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.adminService.updateTask(id, data);
  }

  @Get('task-completions/pending')
  getPendingTaskCompletions() {
    return this.adminService.getPendingTaskCompletions();
  }

  @Patch('task-completions/:id/approve')
  approveTaskCompletion(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approveTaskCompletion(id);
  }

  @Patch('task-completions/:id/reject')
  rejectTaskCompletion(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.rejectTaskCompletion(id);
  }

  @Get('deposits/pending')
  getPendingDeposits() {
    return this.adminService.getPendingDeposits();
  }

  @Patch('deposits/:id/approve')
  approveDeposit(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approveDeposit(id);
  }

  @Patch('deposits/:id/reject')
  rejectDeposit(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.rejectDeposit(id);
  }

  @Get('withdrawals/pending')
  getPendingWithdrawals() {
    return this.adminService.getPendingWithdrawals();
  }

  @Patch('withdrawals/:id/approve')
  approveWithdrawal(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approveWithdrawal(id);
  }

  @Patch('withdrawals/:id/reject')
  rejectWithdrawal(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.rejectWithdrawal(id);
  }

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // ===== BANK ACCOUNTS =====
  @Get('bank-accounts')
  getBankAccounts() {
    return this.adminService.getBankAccounts();
  }

  @Post('bank-accounts')
  createBankAccount(@Body() data: any) {
    return this.adminService.createBankAccount(data);
  }

  @Patch('bank-accounts/:id')
  updateBankAccount(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.adminService.updateBankAccount(id, data);
  }

  @Delete('bank-accounts/:id')
  deleteBankAccount(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteBankAccount(id);
  }

  // ===== USER INVESTMENTS =====
  @Get('investments')
  getAllInvestments() {
    return this.adminService.getAllInvestments();
  }

  // ===== BALANCE ADJUSTMENT =====
  @Patch('users/:id/balance')
  adjustBalance(@Param('id', ParseIntPipe) id: number, @Body() body: { amount: number; note?: string }) {
    return this.adminService.adjustBalance(id, body.amount, body.note);
  }

  // ===== SUPPORT URL =====
  @Get('settings/support')
  getSupportUrl() {
    return this.adminService.getSupportUrl();
  }

  @Patch('settings/support')
  setSupportUrl(@Body('url') url: string) {
    return this.adminService.setSupportUrl(url);
  }
}
