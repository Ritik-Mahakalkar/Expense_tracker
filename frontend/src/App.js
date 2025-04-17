import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    expense_date: "",
  });

  const [expenses, setExpenses] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const user_id = 1;

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:4000/expenses/${user_id}`);
      setExpenses(res.data);
    } catch (err) {
      toast.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, amount, category, expense_date } = form;

    if (!title || !amount || !category || !expense_date) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      await axios.post("http://localhost:4000/expenses", { ...form, user_id });
      toast.success("Expense added!");
      setForm({ title: "", amount: "", category: "", expense_date: "" });
      fetchExpenses();
    } catch (err) {
      toast.error("Error adding expense");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/expenses/${id}`);
      toast.success("Expense deleted!");
      fetchExpenses();
    } catch (err) {
      toast.error("Error deleting expense");
    }
  };

  const filteredExpenses = filterCategory
    ? expenses.filter((e) => e.category === filterCategory)
    : expenses;

  const total = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return (
    <div className="app-wrapper">
      <ToastContainer />
      <div className="container py-5">
        <div className="glass-card p-4 shadow-lg">
          <h2 className="text-center mb-4 fw-bold text-primary"> Expense Tracker</h2>

          {/* Form */}
          <form className="row g-3 mb-4" onSubmit={handleSubmit}>
            <div className="col-md-3">
              <input
                name="title"
                className="form-control"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-2">
              <input
                name="amount"
                type="number"
                className="form-control"
                placeholder="Amount"
                value={form.amount}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <select
                name="category"
                className="form-select"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Shopping">Shopping</option>
                <option value="Bills"> Bills</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-2">
              <input
                name="expense_date"
                type="date"
                className="form-control"
                value={form.expense_date}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-gradient w-100">
                Add Expense
              </button>
            </div>
          </form>

          {/* Filter */}
          <div className="row mb-3">
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All</option>
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Shopping">Shopping</option>
                <option value="Bills">Bills</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Loader */}
          {loading && <div className="text-center my-3">Loading...</div>}

          {/* Expense List */}
          <div className="list-group">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="list-group-item d-flex justify-content-between align-items-center rounded mb-2"
              >
                <div>
                  <h6 className="mb-1">{exp.title}</h6>
                  <small className="text-muted">{exp.expense_date}</small>
                  
                </div>
                <div>
                  <strong className="me-3 text-success">₹{exp.amount}</strong>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(exp.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="text-end mt-4">
            <h5 className="fw-bold">Total Spent: ₹{total.toFixed(2)}</h5>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
