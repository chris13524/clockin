import {Component, OnInit} from "@angular/core";
import {Meta, Title} from "@angular/platform-browser";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";

declare const $: any;

@Component({
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"]
})
export class DashboardComponent implements OnInit {
  constructor(private title: Title,
              private meta: Meta,
              private router: Router,
              private http: HttpClient) {
    title.setTitle("ClockIn");
    meta.addTag({name: "robots", content: "noindex"});
  }
  
  token: string;
  email: string;
  projects: Project[] = [];
  
  ngOnInit(): void {
    this.token = localStorage.getItem("token");
    if (this.token == null) this.router.navigate(["/"]);
    
    this.http.get(environment.api + "/me", {headers: {"Authorization": "Token " + this.token}})
      .subscribe((res: {
        id: number,
        email: string
      }) => {
        this.email = res.email;
        
        this.http.get(environment.api + "/projects", {headers: {"Authorization": "Token " + this.token}})
          .subscribe((res: Project[]) => {
            this.projects = res;
            let projectId = Number(localStorage.getItem("project"));
            if (projectId != null) {
              for (let i = 0; i < this.projects.length; i++) {
                let project = this.projects[i];
                if (project.id == projectId) {
                  this.selectedProject = i;
                }
              }
            }
            if (this.selectedProject == null && this.projects.length > 0) {
              this.selectedProject = 0;
            }
          });
      }, () => this.logout());
  }
  
  logout(): void {
    localStorage.removeItem("token");
    this.router.navigate(["/"]);
  }
  
  _selectedProject: number | null = null;
  get selectedProject(): number | null {
    return this._selectedProject;
  }
  
  set selectedProject(id: number | null) {
    this._selectedProject = id;
    localStorage.setItem("project", String(id));
  }
  
  updatedProjectName = "";
  
  saveProject(): void {
    const project = this.projects[this.selectedProject];
    this.http.put(environment.api + "/projects/" + project.id, {
      name: this.updatedProjectName
    }, {headers: {"Authorization": "Token " + this.token}})
      .subscribe(res => {
        this.projects[this.selectedProject].name = this.updatedProjectName;
        $("#editProjectModal").modal("hide");
      }, err => alert("Error while saving project."));
  }
  
  newProjectName = "";
  
  createProject(): void {
    this.http.post(environment.api + "/projects", {
      name: this.newProjectName
    }, {headers: {"Authorization": "Token " + this.token}})
      .subscribe((res: Project) => {
        $("#createProjectModal").modal("hide");
        this.projects.push(res);
        this.selectedProject = this.projects.length - 1;
        this.newProjectName = "";
      }, err => alert("Error while creating project."));
  }
  
  deleteProject(): void {
    const project = this.projects[this.selectedProject];
    this.http.delete(environment.api + "/projects/" + project.id, {headers: {"Authorization": "Token " + this.token}})
      .subscribe(res => {
        this.projects.splice(this.selectedProject, 1);
        if (this.selectedProject >= this.projects.length) {
          this.selectedProject--;
        }
        if (this.selectedProject == -1) {
          this.selectedProject = null;
        }
        $("#deleteProjectModal").modal("hide");
      }, err => alert("Error while deleting project."));
  }
  
  timerStart: number | null = null;
  duration: string | null = null;
  intervalTimer: number;
  
  clockInOut(): void {
    if (this.timerStart == null) {
      this.timerStart = currentTime();
      const compute = () => {
        this.duration = this.computeDuration();
        this.title.setTitle("ClockIn - " + this.duration);
      };
      this.intervalTimer = setInterval(compute, 1000);
      compute();
    } else {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
      this.title.setTitle("ClockIn");
      
      this.submitTimeEntry(this.timerStart, currentTime());
      this.timerStart = null;
      this.duration = null;
    }
  }
  
  computeDuration(): string | null {
    if (this.timerStart == null) return null;
    
    let seconds = currentTime() - this.timerStart;
    let minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    let hours = Math.floor(minutes / 60);
    minutes -= hours * 60;
    
    let durationString = "";
    if (hours > 0) durationString += hours + "h ";
    if (minutes > 0) durationString += minutes + "m ";
    durationString += seconds + "s";
    
    return durationString;
  }
  
  submitTimeEntry(from: number, to: number): void {
    alert("Duration: " + (to - from));
  }
}

class Project {
  id: number;
  name: string;
}

/**
 * Returns the number of seconds since 1970 UTC.
 * @returns {number}
 */
export function currentTime(): number {
  return Math.floor(currentTimeMilli() / 1000);
}

/**
 * Returns the number of milliseconds since 1970 UTC.
 * @returns {number}
 */
export function currentTimeMilli(): number {
  return Date.now() + ((<any>window).timeOffset || 0) * 1000;
}
