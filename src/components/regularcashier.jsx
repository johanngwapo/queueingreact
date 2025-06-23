import React, { useEffect, useRef, useState } from 'react'
import './queuemanager.css'

function RegularCashier({ cashierQueue, onServe, isIdle, cashierId, assigned, onRemoveFromQueue, onRemoveAssigned }) {
  const timerRef = useRef(null)
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [timerKey, setTimerKey] = useState(0)

  useEffect(() => {
    if (isIdle && cashierQueue.length > 0) {
      onServe()
    }
  }, [isIdle, cashierQueue])

  useEffect(() => {
    if (!isIdle && assigned) {
      setTimerKey(prev => prev + 1)
    } else {
      setSecondsLeft(null)
    }
  }, [assigned, isIdle])

  useEffect(() => {
    if (!isIdle && assigned) {
      const randomMs = 30000 + Math.floor(Math.random() * 30001)
      const randomSec = Math.floor(randomMs / 1000)
      setSecondsLeft(randomSec)
      timerRef.current = setTimeout(() => {
        setSecondsLeft(null)
        onServe()
      }, randomMs)
      const interval = setInterval(() => {
        setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0))
      }, 1000)
      return () => {
        clearTimeout(timerRef.current)
        clearInterval(interval)
      }
    }
  }, [timerKey])

  return (
    <div className="cashier-box regular-cashier-box">
      <h3>Regular Cashier{cashierId !== undefined ? ` ${cashierId + 1}` : ''}</h3>
      <div className="cashier-status">
        <strong>Status:</strong> {isIdle ? 'Idle' : 'Serving'}
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Current Customer:</strong>
        {assigned ? (
          <>
            {assigned}
            <button 
  onClick={() => onRemoveFromQueue?.(idx)} 
  style={{ 
    marginLeft: 8, 
    backgroundColor: 'black', 
    color: 'red', 
    fontSize: '12px', 
    padding: '2px 6px', 
    border: 'none', 
    borderRadius: '3px',
    cursor: 'pointer'
  }}
>
  x
</button>
          </>
        ) : 'None'}
      </div>
      <div className="cashier-queue-list" style={{ marginBottom: 16 }}>
        <strong>Queue:</strong>
        {cashierQueue.length === 0 ? (
  <span> No customers in queue.</span>
) : (
  <ol>
    {cashierQueue.map((c, idx) => (
      <li key={idx}>
        {c}
        <button 
  onClick={() => onRemoveFromQueue?.(idx)} 
  style={{ 
    marginLeft: 8, 
    backgroundColor: 'black', 
    color: 'red', 
    fontSize: '12px', 
    padding: '2px 6px', 
    border: 'none', 
    borderRadius: '3px',
    cursor: 'pointer'
  }}
>
  x
</button>
      </li>
    ))}
  </ol>
)}
      </div>
      {!isIdle && assigned && (
        <div className="cashier-timer">
          Serving... {secondsLeft !== null ? `${secondsLeft}s left` : ''}
        </div>
      )}
    </div>
  )
}

export default RegularCashier
