import { Component, Inject, OnInit } from '@angular/core';
import { expand, flyInOut } from '../animations/app.animation';
import { LeaderService } from '../services/leader.service';
import { Leader } from '../shared/leader';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    animations: [
      flyInOut(),
      expand()
    ]
})
export class AboutComponent implements OnInit {

  leaders: Leader[];
  constructor(private leaderService: LeaderService, @Inject('baseURL') public BaseURL) { }

  ngOnInit(): void {
    this.leaderService.getAllLeaders().subscribe((leaders)=>{this.leaders = leaders} );
  }

}
