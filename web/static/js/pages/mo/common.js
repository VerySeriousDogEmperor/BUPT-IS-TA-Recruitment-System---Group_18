function moEscapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function moIcon(name) {
    return `<i data-lucide="${name}"></i>`;
}

function moInitials(name) {
    const parts = String(name || 'MO')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (!parts.length) return 'MO';
    return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('');
}

function moFormatDate(value, options = {}) {
    if (!value) return 'Not set';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }
    return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    });
}

function moFormatDateTime(value) {
    return moFormatDate(value, {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function moFormatHours(value) {
    const number = Number(value || 0);
    return `${Number.isInteger(number) ? number : number.toFixed(1)}h`;
}

function moParseList(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    return String(value || '')
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function moParseDateInput(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
}

function moStatusLabel(status) {
    const labels = {
        draft: 'Draft',
        pending: 'Pending',
        published: 'Published',
        completed: 'Completed',
        approved: 'Approved',
        rejected: 'Rejected',
        withdrawn: 'Withdrawn'
    };
    return labels[status] || status || 'Unknown';
}

function moLogoutFallback() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    sessionStorage.clear();
    window.location.href = '/login.html?mode=staff&role=mo';
}

async function handleLogout() {
    if (!window.confirm('Are you sure you want to logout?')) {
        return;
    }

    try {
        await API.auth.logout();
    } catch (error) {
        console.warn('MO logout fell back to local cleanup:', error);
    }

    moLogoutFallback();
}

async function ensureMOAuth() {
    try {
        const me = await API.auth.me();
        if (!me || me.role !== 'mo') {
            moLogoutFallback();
            return null;
        }

        document.querySelectorAll('.user-name').forEach((node) => {
            node.textContent = me.name || 'Module Organiser';
        });
        document.querySelectorAll('.user-role').forEach((node) => {
            node.textContent = me.email || 'MO Account';
        });
        document.querySelectorAll('.user-avatar').forEach((node) => {
            node.textContent = moInitials(me.name);
        });

        return me;
    } catch (error) {
        console.error('Failed to validate MO session:', error);
        moLogoutFallback();
        return null;
    }
}
