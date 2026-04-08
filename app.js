console.log('app.js loading...');

window.onerror = function(msg, url, line, col, error) {
    console.error('Global error caught:', msg, 'at', line, ':', col);
    return false;
};

const initApp = () => {
    console.log('initApp started');
    // Selectors
    const form = document.getElementById('analysis-form');
    const steps = document.querySelectorAll('.form-step');
    const navItems = document.querySelectorAll('.nav-item');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const toast = document.getElementById('toast');
    const finalSummary = document.getElementById('final-summary');
    const saveBtn = document.getElementById('save-draft');
    const resetBtn = document.getElementById('reset-form');

    if (!nextBtn) {
        console.error('nextBtn not found!');
        return;
    }

    let currentStep = 1;

    // Functions
    const showToast = (msg) => {
        console.log('Toast:', msg);
        if (!toast) return;
        toast.textContent = msg;
        toast.className = 'toast show';
        setTimeout(() => toast.className = 'toast', 3000);
    };

    const updateUI = () => {
        console.log('Updating UI for step:', currentStep);
        steps.forEach((s, i) => {
            if (i + 1 === currentStep) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });

        navItems.forEach((n, i) => {
            n.classList.toggle('active', i + 1 === currentStep);
            n.classList.toggle('completed', i + 1 < currentStep);
        });

        if (prevBtn) prevBtn.disabled = currentStep === 1;
        if (nextBtn) {
            nextBtn.textContent = currentStep === steps.length ? '完了' : '次へ進む';
        }

        if (currentStep === 5) generateSummary();
    };

    const generateSummary = () => {
        const d = (id) => {
            const el = document.getElementById(id);
            return el ? (el.value || '(未入力)') : '(ID不備)';
        };
        if (finalSummary) {
            finalSummary.innerHTML = `
                <div class="summary-section">
                    <h4 style="color: #818cf8; margin-bottom: 1rem;">■ Step 1: 経験の構造化</h4>
                    <p><strong>経験概要:</strong> ${d('experience-context')}</p>
                    <p><strong>成功体験:</strong> ${d('experience-success')}</p>
                    <p><strong>失敗・苦労:</strong> ${d('experience-failure')}</p>
                </div>
                <div class="summary-section" style="margin-top: 1.5rem;">
                    <h4 style="color: #818cf8; margin-bottom: 1rem;">■ Step 2: 傾向の特定</h4>
                    <p><strong>活躍条件:</strong> ${d('high-performance')}</p>
                    <p><strong>停滞パターン:</strong> ${d('stagnation-pattern')}</p>
                </div>
                <div class="summary-section" style="margin-top: 1.5rem;">
                    <h4 style="color: #818cf8; margin-bottom: 1rem;">■ Step 3: 武器と盾</h4>
                    <p><strong>強みの名称:</strong> ${d('strength-name')}</p>
                    <p><strong>根拠:</strong> ${d('strength-detail')}</p>
                    <p><strong>弱み:</strong> ${d('weakness')}</p>
                    <p><strong>対策:</strong> ${d('weakness-countermeasure')}</p>
                </div>
                <div class="summary-section" style="margin-top: 1.5rem;">
                    <h4 style="color: #818cf8; margin-bottom: 1rem;">■ Step 4: 社会での再現性</h4>
                    <p><strong>貢献イメージ:</strong> ${d('contribution')}</p>
                    <p><strong>リスク管理:</strong> ${d('risk-control')}</p>
                </div>
            `;
        }
    };

    const saveData = () => {
        try {
            const data = {};
            if (form) {
                form.querySelectorAll('input, textarea').forEach(el => {
                    if (el.id) data[el.id] = el.value;
                });
            }
            localStorage.setItem('career_analysis_v1', JSON.stringify(data));
            showToast('進捗を保存しました');
        } catch (e) {
            console.warn('saveData: localStorage is not accessible:', e);
        }
    };

    const loadData = () => {
        try {
            const saved = JSON.parse(localStorage.getItem('career_analysis_v1') || '{}');
            Object.entries(saved).forEach(([id, val]) => {
                const el = document.getElementById(id);
                if (el) el.value = val;
            });
        } catch (e) {
            console.warn('loadData: localStorage is not accessible:', e);
        }
    };

    // Event Listeners
    nextBtn.addEventListener('click', () => {
        console.log('Next button clicked. Current step:', currentStep);
        if (currentStep < steps.length) {
            currentStep++;
            console.log('Moving to step:', currentStep);
            updateUI();
            saveData();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showToast('全てのワークが完了しました！');
        }
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateUI();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    if (saveBtn) saveBtn.addEventListener('click', saveData);

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('全ての入力をリセットしますか？')) {
                if (form) form.reset();
                localStorage.removeItem('career_analysis_v1');
                currentStep = 1;
                updateUI();
                showToast('リセット完了');
            }
        });
    }

    const copyBtn = document.getElementById('copy-summary');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = finalSummary ? finalSummary.innerText : '';
            navigator.clipboard.writeText(text).then(() => showToast('コピーしました'));
        });
    }

    const downloadBtn = document.getElementById('download-summary');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const text = finalSummary ? finalSummary.innerText : '';
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'career_self_analysis.txt';
            a.click();
            showToast('ファイルをダウンロードします');
        });
    }

    // Init Logic
    console.log('Executing final init');
    loadData();
    updateUI();
};

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
