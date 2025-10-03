import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ListsService } from '../../services/lists.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lists.html',
  styleUrls: ['./lists.scss'] 
})

export class ListsComponent implements OnInit {
  lists: any[] = [];
  creatingNewList = false;
  newListName = '';

  editingListId: string | null = null; 
  editedListName: string = '';         

  constructor(
    private listsService: ListsService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const token = this.authService.getAccessToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadLists();
  }

  loadLists() {
    this.listsService.getLists().subscribe({
      next: lists => {
        this.lists = lists;
        this.cdr.detectChanges(); 
      },
      error: err => console.error(err)
    });
  }

  addList() {
    if (!this.newListName) return;
    this.listsService.createList(this.newListName).subscribe({
      next: list => {
        this.lists.push(list);
        this.cdr.detectChanges();
        this.newListName = '';
        this.creatingNewList = false;
      },
      error: err => console.error(err)
    });
  }

  startEditingList(list: any) {
    this.editingListId = list._id;
    this.editedListName = list.name;
  }

  saveEditList(list: any) {
    if (!this.editedListName) return;

    this.listsService.updateList(list._id, { name: this.editedListName }).subscribe({
      next: updated => {
        list.name = updated.name;
        this.cancelEditList();
        this.cdr.detectChanges();
      },
      error: err => console.error(err)
    });
  }

  cancelEditList() {
    this.editingListId = null;
    this.editedListName = '';
  }

  deleteList(id: string) {
    this.listsService.deleteList(id).subscribe({
      next: () => this.lists = this.lists.filter(l => l._id !== id),
      error: err => console.error(err)
    });
  }
}
