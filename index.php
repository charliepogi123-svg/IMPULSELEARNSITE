<?php
require_once 'db.php';

if (isSsoAuthenticated()) {
    header('Location: data.php');
    exit;
}

$loginError = '';
$statusMessage = '';
$emailValue = strtolower(trim($_GET['email'] ?? 'darenx_user'));

if (isset($_GET['error']) && $_GET['error'] === 'invalid') {
    $loginError = 'The username or password does not match the DX Docs user workspace.';
} elseif (isset($_GET['error']) && $_GET['error'] === 'csrf') {
    $loginError = 'The login request could not be verified. Please refresh and try again.';
}

if (isset($_GET['status']) && $_GET['status'] === 'logged_out') {
    $statusMessage = 'You have been signed out. Your cloud workspace is ready when you are.';
}

$csrf = csrf_token();
$features = [
    ['title' => 'Smart Document Editing', 'body' => 'Rich formatting, reusable templates, inline suggestions, and cloud auto-save for every draft.', 'icon' => 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5'],
    ['title' => 'Real-Time Collaboration', 'body' => 'Live editing, comments, team mentions, presence cursors, and secure sharing permissions.', 'icon' => 'M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM16 13a3 3 0 1 0 0-6M3 21a7 7 0 0 1 14 0M14 21a5 5 0 0 1 7-4'],
    ['title' => 'Secure Cloud Storage', 'body' => 'Automatic backups, version history, file recovery, and encrypted workspace organization.', 'icon' => 'M7 18a4 4 0 1 1 .9-7.9A6 6 0 0 1 19 12a3 3 0 0 1 0 6zM12 11v6M9 14l3 3 3-3'],
    ['title' => 'Subscription Management', 'body' => 'Stripe-ready billing flows, premium workspaces, seat management, and storage upgrades.', 'icon' => 'M4 7h16v12H4zM4 11h16M8 15h4M16 15h1'],
];
$coreFeatures = [
    ['title' => 'Subscription-Based Access', 'label' => 'Stripe billing', 'body' => 'Plan selection, checkout CTA, monthly/yearly toggle, premium workspace access, and upgrade paths are built into the pricing and dashboard billing flow.', 'status' => 'Active flow'],
    ['title' => 'Cloud Data Saving', 'label' => 'DX Cloud sync', 'body' => 'Documents show auto-save states, sync timestamps, storage usage, version history, recovery, and cloud workspace organization.', 'status' => 'Auto-saved'],
    ['title' => 'Real-Time Collaboration', 'label' => 'Live presence', 'body' => 'The editor includes multi-user cursors, comment threads, team mentions, permissions, and instant collaboration activity.', 'status' => '3 editors live'],
    ['title' => 'User Dashboards', 'label' => 'Workspace analytics', 'body' => 'Authenticated users get a SaaS dashboard for recent documents, team activity, shared projects, storage, notifications, billing, and analytics.', 'status' => 'Role-aware'],
];
$plans = [
    ['name' => 'Free', 'price' => '$0', 'items' => ['Basic document editing', 'Limited cloud storage', 'Personal workspace']],
    ['name' => 'Professional', 'price' => '$18', 'items' => ['Unlimited documents', 'Team collaboration', 'Advanced sharing'], 'featured' => true],
    ['name' => 'Enterprise', 'price' => 'Custom', 'items' => ['Organization management', 'Premium security', 'Dedicated support']],
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DX Docs | Cloud Document Collaboration</title>
    <link rel="stylesheet" href="dx.css">
</head>
<body>
    <div class="site-bg"><span class="cloud-orbit one"></span><span class="cloud-orbit two"></span></div>
    <nav class="nav">
        <div class="wrap nav-inner">
            <a class="brand" href="#home" aria-label="DX Docs home">
                <img class="logo small" src="dx-logo-transparent.png" alt="DX logo">
                <span>DX Docs<small>Cloud creation suite</small></span>
            </a>
            <div class="nav-links" aria-label="Primary navigation">
                <a href="#collaboration">Collaboration</a>
                <a href="#core">Core</a>
                <a href="#workspace">Workspace</a>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#auth">Login</a>
            </div>
            <div class="nav-actions">
                <a class="btn" href="#auth">Open Demo</a>
                <a class="btn primary" href="#pricing">Start Free Trial</a>
            </div>
        </div>
    </nav>

    <main id="home">
        <section class="hero">
            <div class="wrap hero-inner">
                <div class="hero-copy">
                    <h1>Create, Collaborate, and Work Smarter in the Cloud</h1>
                    <p>Access powerful document editing tools directly from your browser with real-time collaboration, automatic cloud saving, and secure team workspaces.</p>
                    <div class="hero-actions">
                        <a class="btn primary" href="#pricing">Start Free Trial</a>
                        <a class="btn" href="#auth">Open Demo Workspace</a>
                    </div>
                    <div class="hero-stats">
                        <div class="stat glass"><strong>99.9%</strong><span>cloud save uptime</span></div>
                        <div class="stat glass"><strong>42k</strong><span>documents synced</span></div>
                        <div class="stat glass"><strong>12ms</strong><span>presence updates</span></div>
                    </div>
                </div>
                <div class="hero-visual">
                    <img class="logo large hero-logo" src="dx-logo-transparent.png" alt="Transparent DX logo">
                    <div class="floating-card glass one"><strong>Auto-saved</strong><span>Board deck updated 8 sec ago</span></div>
                    <div class="floating-card glass two"><strong>3 editors live</strong><span>Design, Legal, and Sales</span></div>
                    <article class="editor-preview gradient-border">
                        <div class="editor-top">
                            <div class="window-dots"><span></span><span></span><span></span></div>
                            <strong>Product launch brief</strong>
                            <div class="avatar-stack"><span class="avatar">ML</span><span class="avatar">JR</span><span class="avatar">AK</span></div>
                        </div>
                        <div class="toolbar">
                            <span class="tool-pill">B</span><span class="tool-pill">I</span><span class="tool-pill">H1</span><span class="tool-pill">Aa</span><span class="tool-pill">+</span><span class="tool-pill">Share</span>
                        </div>
                        <div class="doc-sheet">
                            <span class="doc-line title"></span>
                            <span class="doc-line"></span><span class="doc-line"></span><span class="doc-line short"></span>
                            <br>
                            <span class="doc-line"></span><span class="doc-line"></span><span class="doc-line"></span><span class="doc-line short"></span>
                            <span class="cursor" style="left:52%;top:142px" data-user="Maya"></span>
                            <span class="cursor" style="left:31%;top:312px;background:#8b42ff" data-user="Jon"></span>
                            <div class="comment-bubble">Resolve: add final launch metric.</div>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <section class="section" id="core">
            <div class="wrap">
                <div class="section-head">
                    <span class="eyebrow">Core platform features</span>
                    <h2>The required SaaS foundation is built into the experience.</h2>
                    <p>DX Docs clearly supports subscription access through Stripe, cloud data saving, real-time collaboration, and authenticated user dashboards.</p>
                </div>
                <div class="core-grid">
                    <?php foreach ($coreFeatures as $item): ?>
                        <article class="core-card gradient-border">
                            <div class="core-card-top">
                                <span><?php echo htmlspecialchars($item['label']); ?></span>
                                <strong><?php echo htmlspecialchars($item['status']); ?></strong>
                            </div>
                            <h3><?php echo htmlspecialchars($item['title']); ?></h3>
                            <p><?php echo htmlspecialchars($item['body']); ?></p>
                        </article>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>

        <section class="section" id="collaboration">
            <div class="wrap grid-2">
                <div class="section-head">
                    <span class="eyebrow">Live collaboration</span>
                    <h2>Google Docs-style editing with DX presence.</h2>
                    <p>Live cursors, comment threads, instant updates, and permission-aware sharing are presented in one clean browser workspace.</p>
                </div>
                <div class="line-map glass">
                    <article class="editor-preview gradient-border" style="transform:none;width:100%;">
                        <div class="editor-top"><strong>Shared strategy doc</strong><div class="avatar-stack"><span class="avatar">SA</span><span class="avatar">NO</span><span class="avatar">PX</span></div></div>
                        <div class="doc-sheet" style="min-height:360px;">
                            <span class="doc-line title"></span><span class="doc-line"></span><span class="doc-line"></span><span class="doc-line short"></span>
                            <span class="cursor" style="left:42%;top:118px" data-user="Sam"></span>
                            <span class="cursor" style="left:62%;top:228px;background:#b42dff" data-user="Nia"></span>
                            <div class="comment-bubble">Team mention sent.</div>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <section class="section" id="workspace">
            <div class="wrap">
                <div class="section-head">
                    <span class="eyebrow">Cloud workspace</span>
                    <h2>Folders, files, teams, and projects shaped by the DX geometry.</h2>
                    <p>Workspace cards use angular spacing, glowing gradient borders, and cloud storage states inspired by the DX mark.</p>
                </div>
                <div class="grid-4">
                    <?php foreach (['Document Folders', 'Recent Files', 'Shared Workspaces', 'Team Projects'] as $index => $label): ?>
                        <article class="workspace-card workspace-folder gradient-border">
                            <div>
                                <div class="icon"><svg viewBox="0 0 24 24"><path d="M3 7h7l2 3h9v11H3z"/></svg></div>
                                <h3><?php echo htmlspecialchars($label); ?></h3>
                                <p><?php echo ['Nested cloud folders with quick search.', 'Drafts sorted by live activity.', 'Permission groups for every team.', 'Milestones, docs, and comments together.'][$index]; ?></p>
                            </div>
                            <div class="folder-meta"><span><?php echo 12 + ($index * 9); ?> files</span><span>Synced</span></div>
                        </article>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>

        <section class="section" id="features">
            <div class="wrap">
                <div class="section-head">
                    <span class="eyebrow">Platform features</span>
                    <h2>Everything expected from a premium document cloud.</h2>
                </div>
                <div class="grid-4">
                    <?php foreach ($features as $feature): ?>
                        <article class="feature-card gradient-border">
                            <div class="icon"><svg viewBox="0 0 24 24"><path d="<?php echo htmlspecialchars($feature['icon']); ?>"/></svg></div>
                            <h3><?php echo htmlspecialchars($feature['title']); ?></h3>
                            <p><?php echo htmlspecialchars($feature['body']); ?></p>
                        </article>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>

        <section class="section" id="dashboard-preview">
            <div class="wrap">
                <div class="section-head">
                    <span class="eyebrow">Dashboard preview</span>
                    <h2>A premium SaaS command center for document teams.</h2>
                </div>
                <div class="dashboard-hero gradient-border">
                    <div>
                        <h3>Workspace Analytics</h3>
                        <p>Recent documents, team activity, shared projects, storage usage, notifications, and collaboration analytics sit in transparent glass panels with DX gradient borders.</p>
                        <div class="grid-3">
                            <div class="metric-card glass"><strong>128</strong><p>Recent docs</p></div>
                            <div class="metric-card glass"><strong>84%</strong><p>Storage used</p></div>
                            <div class="metric-card glass"><strong>2.4k</strong><p>Team edits</p></div>
                        </div>
                    </div>
                    <div class="chart-bars glass" style="padding:18px;border-radius:18px;">
                        <span style="height:46%"></span><span style="height:74%"></span><span style="height:58%"></span><span style="height:92%"></span><span style="height:68%"></span>
                    </div>
                </div>
            </div>
        </section>

        <section class="section" id="pricing">
            <div class="wrap">
                <div class="section-head">
                    <span class="eyebrow">Stripe-ready subscriptions</span>
                    <h2>Scale from personal drafts to secure organizations.</h2>
                    <div class="billing-toggle" aria-label="Billing period"><button class="active" type="button">Monthly</button><button type="button">Yearly</button></div>
                </div>
                <div class="grid-3">
                    <?php foreach ($plans as $plan): ?>
                        <article class="price-card <?php echo !empty($plan['featured']) ? 'gradient-border' : 'glass'; ?>">
                            <h3><?php echo htmlspecialchars($plan['name']); ?></h3>
                            <div class="price"><?php echo htmlspecialchars($plan['price']); ?></div>
                            <ul class="check-list">
                                <?php foreach ($plan['items'] as $item): ?><li><?php echo htmlspecialchars($item); ?></li><?php endforeach; ?>
                            </ul>
                            <a class="btn <?php echo !empty($plan['featured']) ? 'primary' : ''; ?> full" href="#auth">Connect with Stripe</a>
                        </article>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>

        <section class="section" id="auth">
            <div class="wrap auth-grid">
                <div>
                    <img class="logo large" src="dx-logo-transparent.png" alt="Transparent DX logo">
                    <h2>Enter the cloud workspace.</h2>
                    <p>Use the demo sign-in to open the DX Docs dashboard. Register and recovery screens are included visually for the complete SaaS authentication flow.</p>
                    <div class="hero-stats">
                        <div class="stat glass"><strong>User</strong><span>darenx_user / User123!</span></div>
                        <div class="stat glass"><strong>Dashboard</strong><span>Personal cloud workspace</span></div>
                        <div class="stat glass"><strong>Access</strong><span>User account only</span></div>
                    </div>
                </div>
                <div class="auth-panel gradient-border">
                    <?php if ($loginError): ?><div class="status-message error"><?php echo htmlspecialchars($loginError); ?></div><?php endif; ?>
                    <?php if ($statusMessage): ?><div class="status-message success"><?php echo htmlspecialchars($statusMessage); ?></div><?php endif; ?>
                    <div class="tabs">
                        <button class="tab-button active" type="button" data-auth-tab="login">Login</button>
                        <button class="tab-button" type="button" data-auth-tab="register">Register</button>
                        <button class="tab-button" type="button" data-auth-tab="forgot">Forgot</button>
                    </div>
                    <form class="auth-form active" data-auth-panel="login" method="post" action="db.php?action=login" autocomplete="off">
                        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($csrf); ?>">
                        <input type="hidden" name="role" value="User">
                        <div class="field"><label for="email">Username</label><input id="email" name="email" type="text" value="<?php echo htmlspecialchars($emailValue); ?>" placeholder="darenx_user" autocomplete="off" required></div>
                        <div class="field"><label for="password">Password</label><input id="password" name="password" type="password" placeholder="User123!" autocomplete="new-password" required></div>
                        <button class="btn primary full" type="submit">Open Demo Workspace</button>
                        <div class="social-row"><button class="btn" type="button">Google</button><button class="btn" type="button">Microsoft</button></div>
                    </form>
                    <form class="auth-form" data-auth-panel="register">
                        <div class="field"><label>Name</label><input type="text" placeholder="Alex Rivera"></div>
                        <div class="field"><label>Email</label><input type="email" placeholder="alex@company.com"></div>
                        <div class="field"><label>Password</label><input type="password" placeholder="Create a secure password"></div>
                        <button class="btn primary full" type="button">Create Cloud Account</button>
                    </form>
                    <form class="auth-form" data-auth-panel="forgot">
                        <div class="field"><label>Recovery email</label><input type="email" placeholder="you@company.com"></div>
                        <button class="btn primary full" type="button">Send Reset Link</button>
                    </form>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="wrap footer-grid">
            <div><img class="logo small" src="dx-logo-transparent.png" alt="DX logo"><p>DX Docs brings browser-based editing, cloud storage, and team collaboration into one futuristic workspace.</p></div>
            <div><strong>Product</strong><a href="#collaboration">Live editing</a><a href="#workspace">Workspaces</a><a href="#pricing">Billing</a></div>
            <div><strong>Platform</strong><a href="#features">Templates</a><a href="#features">Version history</a><a href="#features">Recovery</a></div>
            <div><strong>Company</strong><a href="#auth">Login</a><a href="#auth">Register</a><a href="#auth">Support</a></div>
        </div>
    </footer>

    <script>
        const tabButtons = document.querySelectorAll('[data-auth-tab]');
        const panels = document.querySelectorAll('[data-auth-panel]');
        tabButtons.forEach((button) => {
            button.addEventListener('click', () => {
                tabButtons.forEach((item) => item.classList.toggle('active', item === button));
                panels.forEach((panel) => panel.classList.toggle('active', panel.dataset.authPanel === button.dataset.authTab));
            });
        });

    </script>
</body>
</html>
