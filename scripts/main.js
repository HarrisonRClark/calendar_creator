document.addEventListener('DOMContentLoaded', (event) => {

    const submitBtn = document.getElementById('submitBtn');
    const submitBtn2 = document.getElementById('submitBtn2');

    const form = document.getElementById('user-form');

    const configureBtn = document.getElementById('configureBtn');
    const configureBtn2 = document.getElementById('configureBtn2');
    var configureModal = new bootstrap.Modal(document.getElementById('configureModal'), {});
    var configureModal2 = new bootstrap.Modal(document.getElementById('configureModal2'), {});

    const itemForm = document.getElementById('itemForm');
    const itemForm2 = document.getElementById('itemForm2');

    const itemsList = document.getElementById('itemsList');
    const itemsList2 = document.getElementById('itemsList2');

    function loadItems() {
        const items = JSON.parse(localStorage.getItem('items')) || [];
        itemsList.innerHTML = '';
        items.forEach((item, index) => {
          const listItem = document.createElement('li');
          listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
          listItem.innerHTML = `
            <span>${item.title} - Day: ${item.delta}</span>
            <button class="btn btn-danger btn-sm" onclick="removeItem(${index})">🗑️ Remove</button>
          `;
          itemsList.appendChild(listItem);
        });
    }
    function loadItems2() {
        const items2 = JSON.parse(localStorage.getItem('items2')) || [];
        itemsList2.innerHTML = '';
        items2.forEach((item, index) => {
          const listItem = document.createElement('li');
          listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
          listItem.innerHTML = `
            <span>${item.title} - Day: ${item.delta}</span>
            <button class="btn btn-danger btn-sm" onclick="removeItem2(${index})">🗑️ Remove</button>
          `;
          itemsList2.appendChild(listItem);
        });
    }

    function saveItems(items) {
        localStorage.setItem('items', JSON.stringify(items));
    }

    function saveItems2(items) {
        localStorage.setItem('items2', JSON.stringify(items));
    }

    itemForm.onsubmit = function(event) {
        event.preventDefault();
        const title = document.getElementById('titleInput').value.trim();
        const delta = document.getElementById('deltaInput').value.trim();
        if (title && delta) {
          const items = JSON.parse(localStorage.getItem('items')) || [];
          items.push({ title, delta });
          saveItems(items);
          loadItems();
          itemForm.reset();
        }
    };

    itemForm2.onsubmit = function(event) {
        event.preventDefault();
        const title = document.getElementById('titleInput2').value.trim();
        const delta = document.getElementById('deltaInput2').value.trim();
        if (title && delta) {
          const items = JSON.parse(localStorage.getItem('items2')) || [];
          items.push({ title, delta });
          saveItems2(items);
          loadItems2();
          itemForm2.reset();
        }
    };

    window.removeItem = function(index) {
        const items = JSON.parse(localStorage.getItem('items')) || [];
        items.splice(index, 1);
        saveItems(items);
        loadItems();
    };
    window.removeItem2 = function(index) {
        const items = JSON.parse(localStorage.getItem('items2')) || [];
        items.splice(index, 1);
        saveItems2(items);
        loadItems2();
    };
  
    submitBtn.addEventListener('click', function(event) {
        const name = form.nameField.value;
        const startDate = new Date(form.startDatePicker.value);
        const items = JSON.parse(localStorage.getItem('items')) || [];
        generateCalendar(items, name, startDate)
    });

    submitBtn2.addEventListener('click', function(event) {
        const name = form.nameField.value;
        const startDate = new Date(form.startDatePicker.value);
        const items = JSON.parse(localStorage.getItem('items2')) || [];
        generateCalendar(items, name, startDate)
    });

    configureBtn.addEventListener('click', function() {
        loadItems();
        configureModal.show();
    });
    configureBtn2.addEventListener('click', function() {
        loadItems2();
        configureModal2.show();
    });

    function generateCalendar(items, name, startDate){
        // Construct ICS content
        let icsContent = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//HARRISONCLARK//EN\r\n';
        items.forEach((item, index) => {
            const eventDate = new Date(startDate);
            eventDate.setDate(startDate.getDate() + Number(item.delta));
            
            const eventEndDate = new Date(eventDate);
            // Correctly increment the end date
            eventEndDate.setDate(eventDate.getDate() + 1);

            // Format the date for ICS, removing time component for DATE value
            const icsDate = eventDate.toISOString().split('T')[0].replace(/-/g, '');
            const icsEndDate = eventEndDate.toISOString().split('T')[0].replace(/-/g, '');

            const eventName = `${item.title} - ${name}`;

            // Generate UID based on event date and a random segment
            const uid = `uid-${eventDate.getTime()}-${Math.random().toString(36).substring(2, 15)}`;

            // Add DTSTAMP using the current date and time in UTC format
            const dtStamp = new Date().toISOString().replace(/-|:|\.\d\d\d/g, '').replace('Z', '');

            icsContent +=
                'BEGIN:VEVENT\r\n' +
                `SUMMARY:${eventName}\r\n` +
                `DTSTART;VALUE=DATE:${icsDate}\r\n` +
                `DTEND;VALUE=DATE:${icsEndDate}\r\n` +
                `DTSTAMP:${dtStamp}\r\n` +
                `UID:${uid}\r\n` +
                'END:VEVENT\r\n';
        });
        icsContent += 'END:VCALENDAR';

        // Trigger download of ICS file
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, 'events.ics');
        } else {
            const link = document.createElement('a');
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'events.ics');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
  });
  