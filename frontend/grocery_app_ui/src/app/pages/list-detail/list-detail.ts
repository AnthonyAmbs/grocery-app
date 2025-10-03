import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListsService, Item, List } from '../../services/lists.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-list-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-detail.html',
  styleUrls: ['./list-detail.scss']
})

export class ListDetailComponent implements OnInit {
  listId: string | null = null;
  listName = '';
  items: (Item & { found?: boolean })[] = [];

  newItemName = '';
  newItemQuantity: number | null = null;
  newItemCategory = '';

  editingItemId: string | null = null;
  editedItemName = '';
  editedItemQuantity: number | null = null;
  editedItemCategory = '';

  constructor(
    private route: ActivatedRoute,
    private listsService: ListsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.listId = this.route.snapshot.paramMap.get('id');
    if (this.listId) this.loadListItems();
  }

  loadListItems() {
    if (!this.listId) return;
    this.listsService.getList(this.listId).subscribe({
      next: (list: List) => {
        this.listName = list.name;
        this.items = list.items || [];
        this.cdr.detectChanges();
      },
      error: err => console.error('Load list failed', err)
    });
  }

  addItem() {
    if (!this.newItemName || !this.listId) return;

    const item: Item = {
      name: this.newItemName,
      quantity: this.newItemQuantity || undefined,
      category: this.newItemCategory || undefined
    };

    this.listsService.addItem(this.listId, item).subscribe({
      next: (updatedList: List) => {
        this.items = updatedList.items || [];
        this.newItemName = '';
        this.newItemQuantity = null;
        this.newItemCategory = '';
      },
      error: err => console.error('Add item failed', err)
    });
  }

  toggleFound(item: Item) {
  if (!this.listId || !item._id) return;
    const updated = { found: !item.found };
    this.listsService.updateItem(this.listId, item._id, updated).subscribe({
      next: (updatedList) => {
        this.items = this.items.map(i =>
          i._id === item._id ? { ...i, found: updated.found } : i
        );
      },
      error: err => console.error('Failed to update item', err)
    });
  }


  deleteItem(itemId: string | undefined) {
    if (!this.listId || !itemId) return;
    this.listsService.deleteItem(this.listId, itemId).subscribe({
      next: () => {
        this.items = this.items.filter(i => i._id !== itemId);
      },
      error: err => console.error('Delete item failed', err)
    });
  }

  startEditingItem(item: Item) {
    this.editingItemId = item._id || null;
    this.editedItemName = item.name;
    this.editedItemQuantity = item.quantity || null;
    this.editedItemCategory = item.category || '';
  }

  saveEditItem() {
    if (!this.listId || !this.editingItemId) return;
    const updatedItem: Item = {
      name: this.editedItemName,
      quantity: this.editedItemQuantity || undefined,
      category: this.editedItemCategory || undefined
    };

    this.listsService.updateItem(this.listId, this.editingItemId, updatedItem).subscribe({
      next: (updatedList: List) => {
        this.items = updatedList.items || [];
        this.cancelEditItem();
      },
      error: err => console.error('Update item failed', err)
    });
  }

  cancelEditItem() {
    this.editingItemId = null;
    this.editedItemName = '';
    this.editedItemQuantity = null;
    this.editedItemCategory = '';
  }

  goBack() {
    this.router.navigate(['/lists']);
  }

}

