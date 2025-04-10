// Dashboard functionality
document.addEventListener('DOMContentLoaded', () => {
  // Status update
  const statusButton = document.querySelector(
    'button:contains("Change Bot Status")'
  );
  if (statusButton) {
    statusButton.addEventListener('click', async () => {
      try {
        const response = await fetch('/api/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'online',
            activity: 'Playing Music',
          }),
        });
        const data = await response.json();
        if (response.ok) {
          alert('<a:yes:1077054716242047046> Bot status updated successfully!');
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        alert('Failed to update bot status: ' + error.message);
      }
    });
  }

  // Prefix update
  const prefixButton = document.querySelector(
    'button:contains("Update Prefix")'
  );
  if (prefixButton) {
    prefixButton.addEventListener('click', async () => {
      const serverId = document.querySelector('.server-select')?.value;
      if (!serverId) {
        alert('Please select a server first');
        return;
      }

      const prefix = prompt('Enter new prefix:');
      if (!prefix) return;

      try {
        const response = await fetch(`/api/prefix/${serverId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prefix }),
        });
        const data = await response.json();
        if (response.ok) {
          alert('Server prefix updated successfully!');
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        alert('Failed to update prefix: ' + error.message);
      }
    });
  }

  // Premium management
  const premiumButton = document.querySelector(
    'button:contains("Manage Premium")'
  );
  if (premiumButton) {
    premiumButton.addEventListener('click', () => {
      window.location.href = '/premium';
    });
  }

  // Analytics view
  const analyticsButton = document.querySelector(
    'button:contains("View Analytics")'
  );
  if (analyticsButton) {
    analyticsButton.addEventListener('click', () => {
      window.location.href = '/analytics';
    });
  }
});
