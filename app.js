const STORAGE_KEY = 'book-tracker-books';

const form = document.getElementById('book-form');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const statusInput = document.getElementById('status');
const titleError = document.getElementById('title-error');
const authorError = document.getElementById('author-error');
const searchInput = document.getElementById('search');
const bookList = document.getElementById('book-list');
const toReadCount = document.getElementById('to-read-count');
const readingCount = document.getElementById('reading-count');
const finishedCount = document.getElementById('finished-count');

let books = loadBooks();

function loadBooks() {
  const savedBooks = localStorage.getItem(STORAGE_KEY);

  if (!savedBooks) {
    return [];
  }

  try {
    const parsedBooks = JSON.parse(savedBooks);
    return Array.isArray(parsedBooks) ? parsedBooks : [];
  } catch (error) {
    return [];
  }
}

function saveBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function clearValidationErrors() {
  titleError.textContent = '';
  authorError.textContent = '';
}

function validateForm() {
  let isValid = true;

  if (!titleInput.value.trim()) {
    titleError.textContent = 'Please enter a title';
    isValid = false;
  } else {
    titleError.textContent = '';
  }

  if (!authorInput.value.trim()) {
    authorError.textContent = 'Please enter an author';
    isValid = false;
  } else {
    authorError.textContent = '';
  }

  return isValid;
}

function renderCounts() {
  const counts = {
    'To read': 0,
    Reading: 0,
    Finished: 0,
  };

  books.forEach((book) => {
    if (counts[book.status] !== undefined) {
      counts[book.status] += 1;
    }
  });

  toReadCount.textContent = counts['To read'];
  readingCount.textContent = counts.Reading;
  finishedCount.textContent = counts.Finished;
}

function renderBooks() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const filteredBooks = books.filter((book) => {
    const fullText = `${book.title} ${book.author}`.toLowerCase();
    return fullText.includes(searchTerm);
  });

  bookList.innerHTML = '';

  if (filteredBooks.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'empty-state';
    emptyItem.textContent = 'No books found.';
    bookList.appendChild(emptyItem);
    renderCounts();
    return;
  }

  filteredBooks.forEach((book) => {
    const item = document.createElement('li');
    item.className = 'book-item';

    const info = document.createElement('div');
    info.className = 'book-info';

    const title = document.createElement('h3');
    title.textContent = book.title;

    const author = document.createElement('p');
    author.textContent = `by ${book.author}`;

    info.appendChild(title);
    info.appendChild(author);

    const actions = document.createElement('div');
    actions.className = 'book-actions';

    const statusLabel = document.createElement('label');
    statusLabel.className = 'status-label';
    statusLabel.textContent = 'Status';

    const select = document.createElement('select');
    select.className = 'status-select';
    select.dataset.id = book.id;

    const options = ['To read', 'Reading', 'Finished'];
    options.forEach((optionValue) => {
      const option = document.createElement('option');
      option.value = optionValue;
      option.textContent = optionValue;
      if (optionValue === book.status) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-btn';
    deleteButton.dataset.id = book.id;
    deleteButton.textContent = 'Delete';

    statusLabel.appendChild(select);
    actions.appendChild(statusLabel);
    actions.appendChild(deleteButton);

    item.appendChild(info);
    item.appendChild(actions);
    bookList.appendChild(item);
  });

  renderCounts();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const newBook = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    status: statusInput.value,
  };

  books.unshift(newBook);
  saveBooks();
  form.reset();
  statusInput.value = 'To read';
  clearValidationErrors();
  renderBooks();
});

searchInput.addEventListener('input', renderBooks);

bookList.addEventListener('change', (event) => {
  const target = event.target;

  if (!target.classList.contains('status-select')) {
    return;
  }

  const selectedId = target.dataset.id;
  const matchingBook = books.find((book) => book.id === selectedId);

  if (!matchingBook) {
    return;
  }

  matchingBook.status = target.value;
  saveBooks();
  renderBooks();
});

bookList.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('.delete-btn');

  if (!deleteButton) {
    return;
  }

  const selectedId = deleteButton.dataset.id;
  books = books.filter((book) => book.id !== selectedId);
  saveBooks();
  renderBooks();
});

renderBooks();
