import './queuemanager.css'
import { useState } from 'react'

function CashierQueue({ queue, onAccept, assigned, onAcceptPriority, onAssignOne, onAssignAll }) {
  const [customer, setCustomer] = useState('')
  const [isPriority, setIsPriority] = useState(false)
  const [autoId, setAutoId] = useState(1)

  const handleAccept = () => {
    let name = customer.trim()
    if (name === '') {
      name = `Customer${autoId}`
      setAutoId(autoId + 1)
    }
    if (isPriority && onAcceptPriority) {
      onAcceptPriority(name)
    } else {
      onAccept(name)
    }
    setCustomer('')
    setIsPriority(false)
  }

  return (
    <div className="cashier-queue-container">
      <div className="cashier-queue-box" data-qlen={queue.length}>
        <h2>Cashier Queue</h2>
        <div className="cashier-queue-controls">
          <input
            type="text"
            value={customer}
            onChange={e => setCustomer(e.target.value)}
            placeholder="Enter customer name"
          />
          <label className="cashier-priority-label">
            <input
              type="checkbox"
              checked={isPriority}
              onChange={e => setIsPriority(e.target.checked)}
              className="cashier-priority-checkbox"
            />
            Priority
          </label>
          <button onClick={handleAccept}>
            Accept Customer
          </button>
        </div>
        <div className="cashier-queue-controls" style={{ marginTop: 8 }}>
          <button onClick={onAssignOne} disabled={queue.length === 0}>
            Assign Customer
          </button>
          <button onClick={onAssignAll} disabled={queue.length === 0} >
            Assign All Customers
          </button>
        </div>
        <div className="cashier-queue-assigned">
          <strong>Assigned Customer:</strong> {assigned ? assigned : 'None'}
        </div>
        <div className="cashier-queue-list">
          <strong>Queue:</strong>
          {queue.length === 0 ? (
            <span> No customers in queue.</span>
          ) : (
            <ol>
              {queue.map((c, idx) => (
                <li key={idx}>{c}</li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}

export default CashierQueue
