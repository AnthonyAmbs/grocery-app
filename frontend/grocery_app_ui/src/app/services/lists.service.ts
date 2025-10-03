import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Item {
  _id?: string;
  name: string;
  quantity?: number;
  category?: string;
}

export interface List {
  _id?: string;
  name: string;
  owner?: string;
  collaborators?: string[];
  items?: Item[];
}

@Injectable({
  providedIn: 'root'
})
export class ListsService {
  private apiUrl = 'http://localhost:5000/lists';

  constructor(private http: HttpClient) {}

  // create a new list
  createList(name: string): Observable<List> {
    return this.http.post<List>(this.apiUrl, { name });
  }

  // get all lists for a user
  getLists(): Observable<List[]> {
    return this.http.get<List[]>(this.apiUrl);
  }

  // get a single list
  getList(id: string): Observable<List> {
    return this.http.get<List>(`${this.apiUrl}/${id}`);
  }

  // update a list's name or collaborators 
  updateList(id: string, data: Partial<List>): Observable<List> {
    return this.http.put<List>(`${this.apiUrl}/${id}`, data);
  }

  // delete a list
  deleteList(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // add an item to a list
  addItem(listId: string, item: Item): Observable<List> {
    return this.http.post<List>(`${this.apiUrl}/${listId}/items`, item);
  }

  // update an item in a list
  updateItem(listId: string, itemId: string, item: Partial<Item>): Observable<List> {
    return this.http.put<List>(`${this.apiUrl}/${listId}/items/${itemId}`, item);
  }

  // delete an item from a list
  deleteItem(listId: string, itemId: string): Observable<List> {
    return this.http.delete<List>(`${this.apiUrl}/${listId}/items/${itemId}`);
  }
}
