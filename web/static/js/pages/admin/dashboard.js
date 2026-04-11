// Dashboard Page Logic

document.addEventListener('DOMContentLoaded', function() {
    initSemesterDropdown();
    loadDashboardContent();
});

function initSemesterDropdown() {
    const button = document.getElementById('semesterButton');
    const menu = document.getElementById('semesterMenu');
    
    if (!button || !menu) return;

    button.addEventListener('click', function(e) {
        e.stopPropagation();
        menu.classList.toggle('active');
    });

    document.addEventListener('click', function() {
        menu.classList.remove('active');
    });

    const options = menu.querySelectorAll('.semester-option');
    options.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.dataset.value;
            const label = this.textContent.trim();
            
            // Update button text
            button.querySelector('.semester-label').textContent = `Current Semester: ${label}`;
            
            // Update active state
            options.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            menu.classList.remove('active');
        });
    });
}

function loadDashboardContent() {
    const content = document.getElementById('adminContent');
    if (!content) return;

    content.innerHTML = `
        <div class="page-header">
            <div class="page-title-section">
                <h1>Global Overview</h1>
                <p>Real-time monitoring of TA recruitment and workload consumption.</p>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-3" style="margin-bottom: 24px;">
            <div class="kpi-card">
                <div class="kpi-header">
                    <div class="kpi-info">
                        <p class="kpi-label">Active Job Openings</p>
                        <h3 class="kpi-value">142<span class="kpi-max">/ 160</span></h3>
                    </div>
                    <div class="kpi-icon kpi-icon-blue">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke-width="2"/>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke-width="2"/>
                        </svg>
                    </div>
                </div>
                <div class="kpi-progress">
                    <div class="kpi-progress-info">
                        <span>Current Fill Rate</span>
                        <span class="kpi-progress-value">88.7%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 88.7%; background: #2563eb;"></div>
                    </div>
                </div>
            </div>

            <div class="kpi-card kpi-card-warning">
                <div class="kpi-header">
                    <div class="kpi-info">
                        <p class="kpi-label">Total Workload (Hrs)</p>
                        <h3 class="kpi-value">2,450<span class="kpi-max">/ 3,000</span></h3>
                    </div>
                    <div class="kpi-icon kpi-icon-amber">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" stroke-width="2"/>
                            <polyline points="12 6 12 12 16 14" stroke-width="2"/>
                        </svg>
                    </div>
                </div>
                <div class="kpi-progress">
                    <div class="kpi-progress-info">
                        <span>Budget Consumption</span>
                        <span class="kpi-progress-value" style="color: #d97706;">81.6%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 81.6%; background: #f59e0b;"></div>
                    </div>
                </div>
                <div class="kpi-ai-insight">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" stroke-width="2"/>
                    </svg>
                    <span>AI 预测: 按当前消耗速率，本学期预算池预计将在第 12 周耗尽。</span>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-header">
                    <div class="kpi-info">
                        <p class="kpi-label">Total TAs Hired</p>
                        <h3 class="kpi-value">128</h3>
                    </div>
                    <div class="kpi-icon kpi-icon-indigo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-width="2"/>
                            <circle cx="9" cy="7" r="4" stroke-width="2"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke-width="2"/>
                        </svg>
                    </div>
                </div>
                <div class="kpi-trend">
                    <span class="trend-up">↑</span>
                    <span>12% from last semester</span>
                </div>
            </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-2" style="margin-bottom: 24px;">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Recruitment Progress Trend</h3>
                </div>
                <div class="card-content">
                    <div class="chart-placeholder" style="height: 288px;">
                        <canvas id="recruitmentChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Workload Allocation by Dept (Hrs)</h3>
                </div>
                <div class="card-content">
                    <div class="chart-placeholder" style="height: 288px;">
                        <canvas id="workloadChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- More Charts -->
        <div class="grid grid-cols-2" style="margin-bottom: 24px;">
            <div class="card">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 class="card-title">Recruitment Fill Rate by Course</h3>
                    <span class="attention-badge">Needs Attention: PHYS105</span>
                </div>
                <div class="card-content">
                    <div class="chart-placeholder" style="height: 288px;">
                        <canvas id="fillRateChart"></canvas>
                    </div>
                    <div class="chart-legend">
                        <span class="legend-item"><span class="legend-dot" style="background: #94a3b8;"></span>Target TAs</span>
                        <span class="legend-item"><span class="legend-dot" style="background: #1e293b;"></span>Current Hired</span>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Global Workload Distribution</h3>
                </div>
                <div class="card-content">
                    <div class="chart-placeholder" style="height: 288px;">
                        <canvas id="distributionChart"></canvas>
                    </div>
                    <p class="chart-note">Tracks the weekly hour commitments across all active TAs to ensure budget compliance and prevent student burnout.</p>
                </div>
            </div>
        </div>
    `;

    // Initialize charts (simplified version without actual charting library)
    initCharts();
}

function initCharts() {
    // In a real implementation, you would use Chart.js or similar
    // For now, we'll just show placeholder text
    const charts = ['recruitmentChart', 'workloadChart', 'fillRateChart', 'distributionChart'];
    
    charts.forEach(chartId => {
        const canvas = document.getElementById(chartId);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            
            // Draw placeholder
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#9ca3af';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Chart Placeholder', canvas.width / 2, canvas.height / 2);
        }
    });
}
