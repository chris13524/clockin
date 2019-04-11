import {Component, Inject, OnInit, PLATFORM_ID} from "@angular/core";
import {Meta, Title} from "@angular/platform-browser";
import {pageHeaders} from "../../utils";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {ActivatedRoute, ActivatedRouteSnapshot, Router} from "@angular/router";
import {tokenize} from "@angular/compiler/src/ml_parser/lexer";
import {isPlatformBrowser} from "@angular/common";

@Component({
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  constructor(private title: Title,
              private meta: Meta,
              private http: HttpClient,
              private route: ActivatedRoute,
              private router: Router,
              @Inject(PLATFORM_ID) private platformId: Object) {
    pageHeaders(title, meta, "ClockIn", "A simple time tracking app for workers.");
  }
  
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.route.queryParamMap.subscribe(paramMap => {
        const loginParam = paramMap.get("login");
        if (loginParam != null) {
          this.http.post(environment.api + "/finalize_login/" + loginParam, {})
            .subscribe((res: { token: string }) => {
              localStorage.setItem("token", res.token);
              this.router.navigate(["dashboard"]);
            }, err => {
              alert("Error while logging in.")
            });
        } else {
          if (localStorage.getItem("token") != null) {
            this.router.navigate(["dashboard"]);
          }
        }
      });
    }
  }
  
  email = "";
  loginSuccess = false;
  
  fixEmail(): void {
    this.email = this.email.toLowerCase();
  }
  
  submit(): void {
    this.http.post(environment.api + "/init_login/" + this.email, {})
      .subscribe(res => {
        this.loginSuccess = true;
      }, err => {
        alert("Error while sending login link. Perhaps you've entered an incorrect email?")
      });
  }
}
