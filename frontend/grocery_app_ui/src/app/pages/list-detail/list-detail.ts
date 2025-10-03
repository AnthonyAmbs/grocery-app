import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListsService, Item, List } from '../../services/lists.service';

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

  trackById(index: number, item: Item & { found?: boolean }) {
    return item._id;
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

    const newItem: Item = {
      name: this.newItemName,
      quantity: this.newItemQuantity || undefined,
      category: this.newItemCategory || undefined,
      found: false
    };

    this.listsService.addItem(this.listId, newItem).subscribe({
      next: (updatedList: List) => {
        const addedItem = updatedList.items?.find(i => i.name === newItem.name && i._id);
        if (addedItem) this.items.push(addedItem);
        this.newItemName = '';
        this.newItemQuantity = null;
        this.newItemCategory = '';
        this.cdr.detectChanges();
      },
      error: err => console.error('Add item failed', err)
    });
  }

  toggleFound(item: Item & { found?: boolean }) {
    if (!this.listId || !item._id) return;

    const updated = { found: !item.found };
    this.listsService.updateItem(this.listId, item._id, updated).subscribe({
      next: () => {
        item.found = !item.found; 
        this.cdr.detectChanges();
      },
      error: err => console.error('Failed to update item', err)
    });
  }

  deleteItem(itemId: string | undefined) {
    if (!this.listId || !itemId) return;
    this.listsService.deleteItem(this.listId, itemId).subscribe({
      next: () => {
        this.items = this.items.filter(i => i._id !== itemId);
        this.cdr.detectChanges();
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

  saveEditItem(item: Item & { found?: boolean }) {
    if (!this.listId || !item._id) return;

    const updatedItem: Partial<Item> = {
      name: this.editedItemName,
      quantity: this.editedItemQuantity || undefined,
      category: this.editedItemCategory || undefined
    };

    this.listsService.updateItem(this.listId, item._id, updatedItem).subscribe({
      next: () => {
        Object.assign(item, updatedItem); 
        this.cancelEditItem();
        this.cdr.detectChanges();
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
