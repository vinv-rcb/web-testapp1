import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminComponent } from './components/admin/admin.component';
import { LogsComponent } from './components/logs/logs.component';
import { MonitorComponent } from './components/monitor/monitor.component';
import { OptiComponent } from './components/opti/opti.component';
import { TeamleadComponent } from './components/teamlead/teamlead.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'logs', component: LogsComponent },
  { path: 'monitor', component: MonitorComponent },
  { path: 'opti', component: OptiComponent },
  { path: 'teamlead', component: TeamleadComponent },
  { path: '**', redirectTo: '/login' }
];
