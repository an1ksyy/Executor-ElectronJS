window.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splash');
    const mainMenu = document.getElementById('main-menu');
    const hacksMenu = document.getElementById('hacks-menu');
    const keyInput = document.getElementById('key-input');
    const usernameInput = document.getElementById('username-input');
    const submitKey = document.getElementById('submit-key');
    const patreonBtn = document.getElementById('patreon-btn');
    const keyError = document.getElementById('key-error');
    const attachHack = document.getElementById('attach-hack');
    const sidebar = document.getElementById('sidebar');
    const logoutBtn = document.getElementById('logout-btn');
    const hacksWelcome = document.getElementById('hacks-welcome');

    // Create loading overlay
    let loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.className = 'fixed inset-0 flex flex-col items-center justify-center z-50 bg-[#1a102acc] hidden';
        loadingOverlay.innerHTML = `
            <div class="glass flex flex-col items-center px-12 py-10">
                <svg class="animate-spin mb-6" width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="#a78bfa" stroke-width="4"/>
                  <path class="opacity-75" fill="#a78bfa" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <div id="loading-status" class="text-lg text-purple-100 font-semibold mb-2">Loading script...</div>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }
    const loadingStatus = document.getElementById('loading-status') || loadingOverlay.querySelector('#loading-status');

    // Hide sidebar during splash
    sidebar.style.visibility = 'hidden';

    // Helper: show/hide menus and logout button
    function showMainMenu() {
        mainMenu.classList.remove('hidden');
        hacksMenu.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
    }
    function showHacksMenu(username) {
        mainMenu.classList.add('hidden');
        hacksMenu.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        if (hacksWelcome) {
            if (username) {
                hacksWelcome.textContent = `Welcome, ${username}!`;
            } else {
                // fallback
                hacksWelcome.textContent = "Welcome, Hacker!";
            }
        }
    }

    // Check for saved key and username
    function tryAutoLogin() {
        const savedKey = localStorage.getItem('edgy-premium-key');
        const savedUsername = localStorage.getItem('edgy-username');
        if (savedKey) {
            window.edgyApi.validateKey(savedKey).then(valid => {
                if (valid) {
                    showHacksMenu(savedUsername);
                } else {
                    localStorage.removeItem('edgy-premium-key');
                    localStorage.removeItem('edgy-username');
                    showMainMenu();
                }
            });
        } else {
            showMainMenu();
        }
    }

    // Splash screen timeout
    setTimeout(() => {
        splash.classList.add('hidden');
        sidebar.style.visibility = 'visible';
        tryAutoLogin();
    }, 1800);

    // Key submit
    submitKey.addEventListener('click', async () => {
        const key = keyInput.value.trim();
        const username = usernameInput.value.trim();
        keyError.classList.add('hidden');
        if (!username) {
            keyError.textContent = "Please enter your username.";
            keyError.classList.remove('hidden');
            return;
        }
        if (!key) {
            keyError.textContent = "Please enter your premium key.";
            keyError.classList.remove('hidden');
            return;
        }
        // Validate key via IPC
        const valid = await window.edgyApi.validateKey(key);
        if (valid) {
            localStorage.setItem('edgy-premium-key', key);
            localStorage.setItem('edgy-username', username);
            showHacksMenu(username);
        } else {
            keyError.textContent = "Invalid key. Please try again or get a valid key on Patreon.";
            keyError.classList.remove('hidden');
        }
    });

    // Patreon button
    patreonBtn.addEventListener('click', () => {
        window.open('https://www.patreon.com/posts/edgyhacks-keys-135604743?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=postshare_creator&utm_content=join_link', '_blank');
    });

    // Add status indicator to hacks menu
    let statusIndicator = document.getElementById('hack-status');
    if (!statusIndicator && hacksMenu) {
        statusIndicator = document.createElement('div');
        statusIndicator.id = 'hack-status';
        statusIndicator.className = 'mb-4 text-lg font-semibold';
        statusIndicator.innerHTML = `<span class="text-gray-400">Status:</span> <span id="hack-status-value" class="text-red-400">Disabled</span>`;
        hacksMenu.insertBefore(statusIndicator, attachHack);
    }
    const statusValue = document.getElementById('hack-status-value') || statusIndicator.querySelector('#hack-status-value');

    // Track hack state
    let hackActive = false;

    // Attach hack button
    if (attachHack) {
        attachHack.addEventListener('click', async () => {
            if (!hackActive) {
                // Show loading overlay
                loadingOverlay.classList.remove('hidden');
                const steps = [
                    "Loading script...",
                    "Enabling ban protection...",
                    "Injecting features...",
                    "Finalizing...",
                    "Done!"
                ];
                let step = 0;
                loadingStatus.textContent = steps[step];

                // Animate steps over 5 seconds
                const interval = setInterval(() => {
                    step++;
                    if (step < steps.length) {
                        loadingStatus.textContent = steps[step];
                    }
                }, 1000);

                setTimeout(async () => {
                    clearInterval(interval);
                    loadingOverlay.classList.add('hidden');
                    const result = await window.edgyApi.attachHack();
                    if (result) {
                        hackActive = true;
                        attachHack.textContent = "Disable";
                        attachHack.classList.remove('bg-gradient-to-r', 'from-purple-600', 'to-fuchsia-600');
                        attachHack.classList.add('bg-gradient-to-r', 'from-pink-700', 'to-purple-900');
                        statusValue.textContent = "Active";
                        statusValue.className = "text-green-400";
                        alert("Hack attached successfully!");
                    } else {
                        alert("Failed to attach hack.");
                    }
                }, 5000);
            } else {
                // Disable hack
                hackActive = false;
                attachHack.textContent = "Attach Hack to Valorant";
                attachHack.classList.remove('bg-gradient-to-r', 'from-pink-700', 'to-purple-900');
                attachHack.classList.add('bg-gradient-to-r', 'from-purple-600', 'to-fuchsia-600');
                statusValue.textContent = "Disabled";
                statusValue.className = "text-red-400";
                alert("Hack disabled.");
            }
        });
    }

    // Logout button in sidebar
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('edgy-premium-key');
            localStorage.removeItem('edgy-username');
            showMainMenu();
        });
    }
});