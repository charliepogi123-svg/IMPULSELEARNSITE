<?php
require_once 'db.php';

if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    ssoLogout();
    header('Location: index.php?status=logged_out');
    exit;
}

requireSsoLogin('data.php');

$user = getSsoUser();
$role = $user['role'] ?? 'User';
$documents = [
    ['title' => 'Product Launch Brief', 'owner' => 'Marketing', 'updated' => 'Edited 2 min ago', 'status' => 'Live'],
    ['title' => 'Q3 Board Narrative', 'owner' => 'Leadership', 'updated' => 'Synced 18 min ago', 'status' => 'Shared'],
    ['title' => 'Customer Research Notes', 'owner' => 'Product', 'updated' => 'Recovered v12', 'status' => 'Versioned'],
    ['title' => 'Enterprise Proposal', 'owner' => 'Sales', 'updated' => 'Auto-saved now', 'status' => 'Private'],
    ['title' => 'Hiring Plan', 'owner' => 'People', 'updated' => 'Commented today', 'status' => 'Team'],
    ['title' => 'Security Review', 'owner' => 'IT', 'updated' => 'Approved today', 'status' => 'Locked'],
];
$activities = [
    ['name' => 'Kiro', 'action' => 'resolved a comment in Product Launch Brief', 'time' => '4m'],
    ['name' => 'Danna May', 'action' => 'shared Enterprise Proposal with Sales', 'time' => '12m'],
    ['name' => 'Macky Joe', 'action' => 'restored version 12 of Research Notes', 'time' => '33m'],
    ['name' => 'Patricia', 'action' => 'upgraded the workspace storage plan', 'time' => '1h'],
];
$coreStatus = [
    ['title' => 'Stripe subscription access', 'value' => 'Professional Trial', 'detail' => 'Billing controls and upgrade CTA enabled'],
    ['title' => 'Cloud data saving', 'value' => 'Synced', 'detail' => 'Autosave, storage usage, and recovery visible'],
    ['title' => 'Real-time collaboration', 'value' => '3 live editors', 'detail' => 'Presence, comments, mentions, and permissions'],
    ['title' => 'User dashboard', 'value' => $role . ' view', 'detail' => 'Role-aware workspace metrics and activity'],
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DX Docs Workspace</title>
    <link rel="stylesheet" href="dx.css">
</head>
<body class="app-body">
    <div class="site-bg"><span class="cloud-orbit one"></span><span class="cloud-orbit two"></span></div>
    <div class="app-shell">
        <aside class="sidebar">
            <a class="brand" href="#dashboard">
                <img class="logo small" src="dx-logo-transparent.png" alt="DX logo">
                <span>DX Docs<small><?php echo htmlspecialchars($role); ?> workspace</small></span>
            </a>
            <nav class="side-nav" aria-label="Workspace navigation">
                <?php
                $nav = [
                    ['Dashboard', 'M3 12h8V3H3zM13 21h8V3h-8zM3 21h8v-7H3z'],
                    ['Documents', 'M6 3h9l5 5v13H6zM14 3v6h6M9 13h8M9 17h8'],
                    ['Shared Files', 'M16 18l6-6-6-6M22 12H9M12 4H5v16h7'],
                    ['Workspaces', 'M3 7h7l2 3h9v11H3z'],
                    ['Activity', 'M4 13h4l2-7 4 14 2-7h4'],
                    ['Billing', 'M4 7h16v12H4zM4 11h16M8 15h4'],
                    ['Settings', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12h2M3 12h2M12 3v2M12 19v2M17 5l-1.4 1.4M6.4 17.6L5 19M19 19l-1.4-1.4M6.4 6.4L5 5'],
                ];
                foreach ($nav as $index => $item):
                ?>
                    <a class="<?php echo $index === 0 ? 'active' : ''; ?>" href="#<?php echo strtolower(str_replace(' ', '-', $item[0])); ?>">
                        <svg viewBox="0 0 24 24"><path d="<?php echo htmlspecialchars($item[1]); ?>"/></svg>
                        <?php echo htmlspecialchars($item[0]); ?>
                    </a>
                <?php endforeach; ?>
            </nav>
            <div class="user-chip glass">
                <strong><?php echo htmlspecialchars($user['name'] ?? 'DX User'); ?></strong>
                <p style="margin:4px 0 0;"><?php echo htmlspecialchars($user['email'] ?? ''); ?></p>
            </div>
        </aside>

        <main class="main">
            <header class="app-top">
                <div>
                    <span class="eyebrow">Autosaved cloud workspace</span>
                    <h3 style="margin:8px 0 0;">Welcome back, <?php echo htmlspecialchars(explode(' ', $user['name'] ?? 'there')[0]); ?></h3>
                </div>
                <input class="search-input" style="max-width:360px;" type="search" placeholder="Search documents, folders, comments">
                <div class="nav-actions">
                    <a class="btn primary" href="#editor">New Document</a>
                    <a class="btn" href="data.php?action=logout">Logout</a>
                </div>
            </header>

            <div class="app-content">
                <section class="dashboard-hero gradient-border" id="dashboard">
                    <div>
                        <h1 style="font-size:clamp(2.4rem,4vw,4.4rem);">Cloud documents that move with your team.</h1>
                        <p>Recent files, shared projects, billing status, storage, notifications, and collaboration analytics are gathered into a single DX-powered dashboard.</p>
                        <div class="hero-actions">
                            <a class="btn primary" href="#editor">Open Editor</a>
                            <a class="btn" href="#billing">Manage Stripe Plan</a>
                        </div>
                    </div>
                    <div class="glass" style="border-radius:22px;padding:20px;">
                        <img class="logo" src="dx-logo-transparent.png" alt="DX logo">
                        <h3 style="margin-top:18px;">Workspace pulse</h3>
                        <div class="progress"><span style="width:78%"></span></div>
                        <p style="margin:12px 0 0;">78% of storage used across 6 active workspaces.</p>
                    </div>
                </section>

                <section class="core-grid" aria-label="Core platform feature status">
                    <?php foreach ($coreStatus as $status): ?>
                        <article class="core-card glass">
                            <div class="core-card-top">
                                <span><?php echo htmlspecialchars($status['title']); ?></span>
                                <strong><?php echo htmlspecialchars($status['value']); ?></strong>
                            </div>
                            <p><?php echo htmlspecialchars($status['detail']); ?></p>
                        </article>
                    <?php endforeach; ?>
                </section>

                <section class="grid-4" aria-label="Workspace metrics">
                    <article class="metric-card glass"><div class="icon"><svg viewBox="0 0 24 24"><path d="M6 3h9l5 5v13H6z"/></svg></div><strong>248</strong><p>Recent Documents</p></article>
                    <article class="metric-card glass"><div class="icon"><svg viewBox="0 0 24 24"><path d="M8 11a4 4 0 1 0 0-8M3 21a7 7 0 0 1 14 0M17 8v6M14 11h6"/></svg></div><strong>36</strong><p>Team Activity</p></article>
                    <article class="metric-card glass"><div class="icon"><svg viewBox="0 0 24 24"><path d="M3 7h7l2 3h9v11H3z"/></svg></div><strong>14</strong><p>Shared Projects</p></article>
                    <article class="metric-card glass"><div class="icon"><svg viewBox="0 0 24 24"><path d="M7 18a4 4 0 1 1 .9-7.9A6 6 0 0 1 19 12a3 3 0 0 1 0 6z"/></svg></div><strong>1.2 TB</strong><p>Storage Usage</p></article>
                </section>

                <section class="section" id="documents" style="padding-top:34px;">
                    <div class="section-head">
                        <span class="eyebrow">Recent documents</span>
                        <h2>Files ready for browser editing.</h2>
                    </div>
                    <div class="doc-grid">
                        <?php foreach ($documents as $document): ?>
                            <article class="doc-card gradient-border">
                                <div class="doc-thumb"><span style="width:72%"></span><span></span><span style="width:52%"></span></div>
                                <h3><?php echo htmlspecialchars($document['title']); ?></h3>
                                <p><?php echo htmlspecialchars($document['owner']); ?> - <?php echo htmlspecialchars($document['updated']); ?></p>
                                <div class="folder-meta"><span><?php echo htmlspecialchars($document['status']); ?></span><span>Open</span></div>
                            </article>
                        <?php endforeach; ?>
                    </div>
                </section>

                <section class="section" id="editor" style="padding-top:20px;">
                    <div class="section-head">
                        <span class="eyebrow">Live editor</span>
                        <h2>Real-time document creation in the browser.</h2>
                    </div>
                    <div class="editor-workspace">
                        <article class="live-editor gradient-border">
                            <div class="editor-top">
                                <div class="window-dots"><span></span><span></span><span></span></div>
                                <strong>Product Launch Brief</strong>
                                <div class="editor-status">
                                    <span id="cloudSaveStatus">Cloud saved</span>
                                    <div class="avatar-stack"><span class="avatar">ML</span><span class="avatar">JR</span><span class="avatar">AK</span></div>
                                </div>
                            </div>
                            <div class="toolbar">
                                <button class="tool-pill" type="button">B</button>
                                <button class="tool-pill" type="button">I</button>
                                <button class="tool-pill" type="button">H1</button>
                                <button class="tool-pill" type="button">List</button>
                                <button class="tool-pill" type="button">Link</button>
                                <button class="tool-pill" type="button">Comment</button>
                                <button class="tool-pill" type="button">Share</button>
                            </div>
                            <div class="editable-page" id="cloudDocument" contenteditable="true" aria-label="Editable document">
                                <h1>Product Launch Brief</h1>
                                <p><strong>Objective:</strong> Align marketing, sales, support, and product teams around the launch narrative for the DX cloud workspace.</p>
                                <p>The release focuses on fast browser editing, automatic cloud saving, live cursor presence, and Stripe-powered subscription controls for premium workspaces.</p>
                                <p>Next steps: finalize launch metrics, resolve security review comments, and prepare the enterprise sharing guide.</p>
                            </div>
                        </article>
                        <aside class="comment-list">
                            <article class="comment-card glass"><strong>Maya Lee</strong><p>Can we mention version recovery in the first paragraph?</p></article>
                            <article class="comment-card glass"><strong>Jon Reyes</strong><p>Sales needs the storage upgrade language before Friday.</p></article>
                            <article class="comment-card glass"><strong>Auto-save</strong><p>All changes synced to DX Cloud just now.</p></article>
                            <article class="comment-card gradient-border"><strong>Permissions</strong><p>Marketing can edit. Legal and Sales can comment.</p></article>
                        </aside>
                    </div>
                </section>

                <section class="grid-2" id="activity">
                    <article class="activity-card glass">
                        <span class="eyebrow">Team activity</span>
                        <h3 style="margin-top:14px;">Live collaboration feed</h3>
                        <?php foreach ($activities as $activity): ?>
                            <div class="activity-row">
                                <div><strong><?php echo htmlspecialchars($activity['name']); ?></strong><p style="margin:2px 0 0;"><?php echo htmlspecialchars($activity['action']); ?></p></div>
                                <span><?php echo htmlspecialchars($activity['time']); ?></span>
                            </div>
                        <?php endforeach; ?>
                    </article>
                    <article class="activity-card gradient-border">
                        <span class="eyebrow">Collaboration analytics</span>
                        <h3 style="margin-top:14px;">Edits this week</h3>
                        <div class="chart-bars">
                            <span style="height:42%"></span><span style="height:62%"></span><span style="height:78%"></span><span style="height:53%"></span><span style="height:96%"></span><span style="height:72%"></span>
                        </div>
                        <p style="margin-top:14px;">The upward DX arrow motif drives progress indicators across analytics, storage, and subscription health.</p>
                    </article>
                </section>

                <section class="section" id="billing" style="padding-top:34px;">
                    <div class="section-head">
                        <span class="eyebrow">Billing</span>
                        <h2>Stripe subscription management.</h2>
                    </div>
                    <div class="grid-3">
                        <article class="price-card glass"><h3>Free</h3><div class="price">$0</div><p>Basic editing and limited storage for personal drafts.</p><button class="btn full" type="button">Current Trial</button></article>
                        <article class="price-card gradient-border"><h3>Professional</h3><div class="price">$18</div><p>Unlimited documents, team collaboration, and advanced sharing.</p><button class="btn primary full" type="button">Upgrade with Stripe</button></article>
                        <article class="price-card glass"><h3>Enterprise</h3><div class="price">Custom</div><p>Organization controls, premium security, and dedicated support.</p><button class="btn full" type="button">Contact Sales</button></article>
                    </div>
                </section>
            </div>
        </main>
    </div>

    <script>
        const links = document.querySelectorAll('.side-nav a');
        links.forEach((link) => {
            link.addEventListener('click', () => {
                links.forEach((item) => item.classList.toggle('active', item === link));
            });
        });

        const cloudDocument = document.getElementById('cloudDocument');
        const cloudSaveStatus = document.getElementById('cloudSaveStatus');
        const savedDocument = localStorage.getItem('dx-cloud-document');
        if (savedDocument) {
            cloudDocument.innerHTML = savedDocument;
        }

        let saveTimer;
        cloudDocument.addEventListener('input', () => {
            cloudSaveStatus.textContent = 'Saving to cloud...';
            window.clearTimeout(saveTimer);
            saveTimer = window.setTimeout(() => {
                localStorage.setItem('dx-cloud-document', cloudDocument.innerHTML);
                cloudSaveStatus.textContent = 'Cloud saved just now';
            }, 650);
        });
    </script>
</body>
</html>
