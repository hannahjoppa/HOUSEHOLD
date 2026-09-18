"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Plus,
  Trash2,
  ArrowRightLeft,
  X,
  CreditCard,
  User,
  ShoppingBag,
  Zap,
  Utensils,
  GraduationCap,
  Baby,
  Wallet,
  TrendingUp,
  LayoutDashboard,
  Receipt,
  PiggyBank,
  CheckCircle2,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "income_semimonthly" | "income_daily" | "expense";
  description: string;
  amount: number;
  category: string;
  paidBy: "Pang" | "Patrick";
  splitWith: "Equally" | "Pang Only" | "Patrick Only";
  date: string;
}

const CATEGORIES = [
  "Market",
  "Groceries",
  "Utility Bills",
  "Eating Out",
  "School",
  "Child - Nayomi",
  "Child - Zion",
  "Child - Ethan",
  "Child - Elle",
  "Child - Zachi",
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Market: <ShoppingBag size={16} />,
  Groceries: <ShoppingBag size={16} />,
  "Utility Bills": <Zap size={16} />,
  "Eating Out": <Utensils size={16} />,
  School: <GraduationCap size={16} />,
  "Child - Nayomi": <Baby size={16} />,
  "Child - Zion": <Baby size={16} />,
  "Child - Ethan": <Baby size={16} />,
  "Child - Elle": <Baby size={16} />,
  "Child - Zachi": <Baby size={16} />,
  "15/30 Salary": <Wallet size={16} />,
  "Daily Income": <TrendingUp size={16} />,
};

const CHART_COLORS = [
  "#007AFF",
  "#5856D6",
  "#FF9500",
  "#FF2D55",
  "#AF52DE",
  "#00C7BE",
  "#34C759",
  "#FFCC00",
];

export default function HouseholdBudgetApp() {
  const [activeTab, setActiveTab] = useState<"overview" | "expenses" | "income">("overview");
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "income_semimonthly",
      description: "15/30 Paycheck",
      amount: 25000,
      category: "15/30 Salary",
      paidBy: "Pang",
      splitWith: "Equally",
      date: "2026-09-15",
    },
    {
      id: "2",
      type: "income_daily",
      description: "Daily Earnings Accumulated",
      amount: 25000,
      category: "Daily Income",
      paidBy: "Patrick",
      splitWith: "Equally",
      date: "2026-09-15",
    },
    {
      id: "3",
      type: "expense",
      description: "Weekly Groceries",
      amount: 3850,
      category: "Groceries",
      paidBy: "Pang",
      splitWith: "Equally",
      date: "2026-09-02",
    },
    {
      id: "4",
      type: "expense",
      description: "Electricity Bill",
      amount: 6240,
      category: "Utility Bills",
      paidBy: "Patrick",
      splitWith: "Equally",
      date: "2026-09-05",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<Transaction["type"]>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [paidBy, setPaidBy] = useState<"Pang" | "Patrick">("Pang");
  const [splitWith, setSplitWith] = useState<"Equally" | "Pang Only" | "Patrick Only">("Equally");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Income Calculations
  const semimonthlyIncome = transactions
    .filter((t) => t.type === "income_semimonthly")
    .reduce((sum, t) => sum + t.amount, 0);

  const dailyIncome = transactions
    .filter((t) => t.type === "income_daily")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = semimonthlyIncome + dailyIncome;

  const pangIncome = transactions
    .filter((t) => t.type !== "expense" && t.paidBy === "Pang")
    .reduce((sum, t) => sum + t.amount, 0);

  const patrickIncome = transactions
    .filter((t) => t.type !== "expense" && t.paidBy === "Patrick")
    .reduce((sum, t) => sum + t.amount, 0);

  // Expense & Settlement Engine Calculations
  const expensesList = transactions.filter((t) => t.type === "expense");
  const incomeList = transactions.filter((t) => t.type !== "expense");

  const totalExpenses = expensesList.reduce((sum, t) => sum + t.amount, 0);
  const netSurplus = totalIncome - totalExpenses;

  const pangPaidTotal = expensesList
    .filter((t) => t.paidBy === "Pang")
    .reduce((sum, t) => sum + t.amount, 0);

  const patrickPaidTotal = expensesList
    .filter((t) => t.paidBy === "Patrick")
    .reduce((sum, t) => sum + t.amount, 0);

  // Accurate split evaluation based on "Split Between" selection
  let pangTargetShare = 0;
  let patrickTargetShare = 0;

  expensesList.forEach((t) => {
    if (t.splitWith === "Equally") {
      pangTargetShare += t.amount / 2;
      patrickTargetShare += t.amount / 2;
    } else if (t.splitWith === "Pang Only") {
      pangTargetShare += t.amount;
    } else if (t.splitWith === "Patrick Only") {
      patrickTargetShare += t.amount;
    }
  });

  const pangBalance = pangPaidTotal - pangTargetShare;

  // Chart data
  const expenseByCat = expensesList.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(expenseByCat).map((cat) => ({
    name: cat,
    value: expenseByCat[cat],
  }));

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newTx: Transaction = {
      id: Date.now().toString(),
      type: transactionType,
      description,
      amount: parseFloat(amount),
      category: transactionType !== "expense" 
        ? (transactionType === "income_semimonthly" ? "15/30 Salary" : "Daily Income") 
        : category,
      paidBy,
      splitWith: transactionType === "expense" ? splitWith : "Equally",
      date: date || new Date().toISOString().split("T")[0],
    };

    setTransactions([newTx, ...transactions]);
    setDescription("");
    setAmount("");
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans p-4 md:p-8 pb-24">
      <div className="max-w-xl mx-auto space-y-5">
        
        {/* Header */}
        <header className="flex items-center justify-between py-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Family Budget App</h1>
            <p className="text-xs text-zinc-400">Income & Contribution Tracker</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#007AFF] text-white px-4 py-2 rounded-full font-semibold text-sm shadow-md hover:bg-[#0062CC] active:scale-95 transition"
          >
            <Plus size={18} />
            <span>Add Entry</span>
          </button>
        </header>

        {/* iOS Segmented Navigation Bar */}
        <div className="grid grid-cols-3 bg-[#1C1C1E] p-1 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === "overview" ? "bg-[#2C2C2E] text-white shadow-sm" : "text-zinc-400"
            }`}
          >
            <LayoutDashboard size={15} /> Overview
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === "expenses" ? "bg-[#2C2C2E] text-white shadow-sm" : "text-zinc-400"
            }`}
          >
            <Receipt size={15} /> Expenses ({expensesList.length})
          </button>
          <button
            onClick={() => setActiveTab("income")}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === "income" ? "bg-[#2C2C2E] text-white shadow-sm" : "text-zinc-400"
            }`}
          >
            <PiggyBank size={15} /> Income ({incomeList.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Main Balance Card */}
            <div className="bg-gradient-to-b from-[#1C1C1E] to-[#121214] p-6 rounded-3xl border border-zinc-800/80 shadow-xl">
              <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                Running Balance
              </span>
              <div className="text-4xl font-extrabold text-white mt-1 tracking-tight">
                ₱{netSurplus.toLocaleString()}
              </div>
              <div className="flex gap-4 text-xs text-zinc-400 mt-2">
                <span>Total Income: <strong className="text-[#34C759]">₱{totalIncome.toLocaleString()}</strong></span>
                <span>Total Expenses: <strong className="text-[#FF3B30]">₱{totalExpenses.toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Income Stream Split */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-zinc-800/60">
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                  <Wallet size={14} className="text-[#007AFF]" /> 15/30 Monthly Bills
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  ₱{semimonthlyIncome.toLocaleString()}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">Fixed bills & overhead</div>
              </div>

              <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-zinc-800/60">
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                  <TrendingUp size={14} className="text-[#34C759]" /> Daily Variable
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  ₱{dailyIncome.toLocaleString()}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">Daily groceries & needs</div>
              </div>
            </div>

            {/* Paid By Split Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-zinc-800/60">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                  <User size={14} className="text-[#007AFF]" /> Pang Paid Total
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  ₱{pangPaidTotal.toLocaleString()}
                </div>
              </div>

              <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-zinc-800/60">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                  <User size={14} className="text-[#5856D6]" /> Patrick Paid Total
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  ₱{patrickPaidTotal.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Equalization Balance Banner */}
            <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FF9500]/15 text-[#FF9500] rounded-xl">
                  <ArrowRightLeft size={20} />
                </div>
                <div>
                  <div className="text-xs text-zinc-400 font-medium uppercase tracking-wide">
                    Settlement Balance
                  </div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {totalExpenses === 0 ? (
                      "No shared expenses logged yet."
                    ) : pangBalance === 0 ? (
                      "Expenses are perfectly balanced!"
                    ) : pangBalance > 0 ? (
                      <>Patrick owes Pang <span className="text-[#FF9500]">₱{Math.abs(pangBalance).toLocaleString()}</span></>
                    ) : (
                      <>Pang owes Patrick <span className="text-[#FF9500]">₱{Math.abs(pangBalance).toLocaleString()}</span></>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="bg-[#1C1C1E] p-5 rounded-2xl border border-zinc-800/60">
                <h3 className="text-sm font-semibold text-zinc-300 mb-3">
                  Expense Distribution
                </h3>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={65}
                        dataKey="value"
                        label={({ name }) => name}
                      >
                        {chartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1C1C1E",
                          borderColor: "#3A3A3C",
                          borderRadius: "12px",
                          color: "#fff",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXPENSES SECTION */}
        {activeTab === "expenses" && (
          <div className="bg-[#1C1C1E] p-5 rounded-2xl border border-zinc-800/60 space-y-3">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-semibold text-zinc-300">Detailed Expenses Log</h3>
              <span className="text-xs text-zinc-400">Total: ₱{totalExpenses.toLocaleString()}</span>
            </div>
            {expensesList.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No expenses logged yet.</p>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {expensesList.map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#2C2C2E] text-[#FF3B30] rounded-xl">
                        {CATEGORY_ICONS[tx.category] || <CreditCard size={16} />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white">{tx.description}</div>
                        <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>{tx.category}</span>
                          <span>•</span>
                          <span>Paid by <strong>{tx.paidBy}</strong> ({tx.splitWith})</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-white">- ₱{tx.amount.toLocaleString()}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">{tx.date}</div>
                    </div>
                    <button onClick={() => handleDelete(tx.id)} className="text-zinc-600 hover:text-[#FF3B30] p-1 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INCOME TRANSPARENCY SECTION */}
        {activeTab === "income" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-zinc-800/60">
                <span className="text-xs text-zinc-400 font-medium">Pang Income Log</span>
                <div className="text-xl font-bold text-[#34C759] mt-1">₱{pangIncome.toLocaleString()}</div>
              </div>
              <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-zinc-800/60">
                <span className="text-xs text-zinc-400 font-medium">Patrick Income Log</span>
                <div className="text-xl font-bold text-[#34C759] mt-1">₱{patrickIncome.toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-[#1C1C1E] p-5 rounded-2xl border border-zinc-800/60 space-y-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-semibold text-zinc-300">Income Entries & Transparency Log</h3>
                <span className="text-xs text-zinc-400">Total: ₱{totalIncome.toLocaleString()}</span>
              </div>
              {incomeList.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center">No income records entered yet.</p>
              ) : (
                <div className="divide-y divide-zinc-800/60">
                  {incomeList.map((tx) => (
                    <div key={tx.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#2C2C2E] text-[#34C759] rounded-xl">
                          {CATEGORY_ICONS[tx.category] || <Wallet size={16} />}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-white">{tx.description}</div>
                          <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                            <span className="text-zinc-300">{tx.category}</span>
                            <span>•</span>
                            <span>Earned by <strong>{tx.paidBy}</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-[#34C759]">+ ₱{tx.amount.toLocaleString()}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">{tx.date}</div>
                      </div>
                      <button onClick={() => handleDelete(tx.id)} className="text-zinc-600 hover:text-[#FF3B30] p-1 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* iOS Modal Sheet for Add Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end justify-center z-50 p-0 md:p-4">
          <div className="bg-[#1C1C1E] w-full max-w-lg rounded-t-3xl md:rounded-3xl border border-zinc-800 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white">Add New Entry</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              {/* Entry Type */}
              <div>
                <label className="text-xs text-zinc-400 font-medium">Entry Type</label>
                <div className="grid grid-cols-3 gap-1 bg-[#2C2C2E] p-1 rounded-xl mt-1">
                  <button
                    type="button"
                    onClick={() => setTransactionType("expense")}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                      transactionType === "expense" ? "bg-[#007AFF] text-white" : "text-zinc-400"
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType("income_semimonthly")}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                      transactionType === "income_semimonthly" ? "bg-[#34C759] text-white" : "text-zinc-400"
                    }`}
                  >
                    15/30 Salary
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType("income_daily")}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                      transactionType === "income_daily" ? "bg-[#34C759] text-white" : "text-zinc-400"
                    }`}
                  >
                    Daily Income
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Grocery run, Salary, or Daily earnings"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 bg-[#2C2C2E] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#007AFF]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium">Amount (₱)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full mt-1 bg-[#2C2C2E] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#007AFF]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-medium">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full mt-1 bg-[#2C2C2E] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#007AFF]"
                    required
                  />
                </div>
              </div>

              {transactionType === "expense" && (
                <>
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full mt-1 bg-[#2C2C2E] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#007AFF]"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Split Between</label>
                    <select
                      value={splitWith}
                      onChange={(e) => setSplitWith(e.target.value as any)}
                      className="w-full mt-1 bg-[#2C2C2E] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#007AFF]"
                    >
                      <option value="Equally">Equally (50 / 50 Shared Expense)</option>
                      <option value="Pang Only">Pang Only (100% Pang Personal)</option>
                      <option value="Patrick Only">Patrick Only (100% Patrick Personal)</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs text-zinc-400 font-medium">
                  {transactionType === "expense" ? "Paid By" : "Earned By"}
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {(["Pang", "Patrick"] as const).map((person) => (
                    <button
                      type="button"
                      key={person}
                      onClick={() => setPaidBy(person)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition ${
                        paidBy === person
                          ? "bg-[#007AFF] text-white border-[#007AFF]"
                          : "bg-[#2C2C2E] text-zinc-300 border-zinc-700"
                      }`}
                    >
                      {person}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#007AFF] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#0062CC] transition mt-2"
              >
                Save Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}