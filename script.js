(() => {
  const BOOKINGS_KEY = 'codeBlazaBookings';

  const loadBookings = () => {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveBookings = (bookings) => {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  };

  const setNavActive = () => {
    const page = document.body.dataset.page;
    document.querySelectorAll('nav a').forEach((link) => {
      if (link.href.includes(`${page}.html`)) link.classList.add('active');
    });
  };

  const renderHistory = () => {
    const body = document.querySelector('.history-table-body');
    if (!body) return;
    const bookings = loadBookings();
    const stat = (course) =>
      bookings.filter((b) => (course ? b.course === course : true)).length;
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    setText('statTotal', stat());
    setText('statPython', stat('Python'));
    setText('statJava', stat('Java'));
    setText('statDsa', stat('Python DSA'));

    if (!bookings.length) {
      body.innerHTML = '<tr><td colspan="5">No bookings yet. Submit one from the Booking page.</td></tr>';
      return;
    }

    body.innerHTML = bookings
      .map(
        (b) => `
      <tr>
        <td>${b.fullName}</td>
        <td>${b.course}</td>
        <td>${b.startDate || '—'}</td>
        <td>${b.fileName || 'Not provided'}</td>
        <td class="status">Booked</td>
      </tr>`
      )
      .join('');
  };

  const setupBookingForm = () => {
    const form = document.getElementById('bookingForm');
    if (!form) return;
    const notice = document.getElementById('bookingNotice');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const bookings = loadBookings();
      const file = data.get('educationForm');
      const fileName = file && file.name ? file.name : '';

      bookings.push({
        fullName: data.get('fullName'),
        email: data.get('email'),
        phone: data.get('phone'),
        course: data.get('course'),
        startDate: data.get('startDate'),
        notes: data.get('notes'),
        fileName,
        createdAt: new Date().toISOString(),
      });

      saveBookings(bookings);
      if (notice) {
        notice.style.display = 'block';
      }
      form.reset();
    });
  };

  const setupHistoryControls = () => {
    const exportBtn = document.getElementById('exportCsv');
    const clearBtn = document.getElementById('clearHistory');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const bookings = loadBookings();
        if (!bookings.length) return;
        const header = ['Name', 'Email', 'Phone', 'Course', 'Start', 'File', 'Created'];
        const rows = bookings.map((b) =>
          [b.fullName, b.email, b.phone, b.course, b.startDate, b.fileName, b.createdAt]
            .map((v) => `"${(v || '').replace(/"/g, '""')}"`)
            .join(',')
        );
        const csv = [header.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'code-blaza-bookings.csv';
        a.click();
        URL.revokeObjectURL(url);
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        localStorage.removeItem(BOOKINGS_KEY);
        renderHistory();
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    setNavActive();
    setupBookingForm();
    renderHistory();
    setupHistoryControls();
  });
})();

