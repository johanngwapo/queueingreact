import { useState, useEffect } from 'react'
import CashierQueue from './cashierqueue'
import RegularCashier from './regularcashier'
import PriorityCashier from './prioritycashier'
import './queuemanager.css'

function QueueManager() {
  const [mainQueue, setMainQueue] = useState([])
  const [cashierQueues, setCashierQueues] = useState([[], []]) 
  const [priorityQueue, setPriorityQueue] = useState([])
  const [assigned, setAssigned] = useState([null, null])
  const [priorityAssigned, setPriorityAssigned] = useState(null)

 
  const handleAccept = (customer) => {
    setMainQueue(prev => [...prev, customer])
  }

  const handleAcceptPriority = (customer) => {
    setPriorityQueue(prev => [...prev, customer])
  }

  useEffect(() => {
    let tempMainQueue = [...mainQueue]
    const newCashierQueues = cashierQueues.map((cq) => {
      let newCQ = [...cq]
      while (newCQ.length < 5 && tempMainQueue.length > 0) {
        newCQ.push(tempMainQueue[0])
        tempMainQueue = tempMainQueue.slice(1)
      }
      return newCQ
    })
    let newPriorityQueue = [...priorityQueue]
    while (newPriorityQueue.length < 5 && tempMainQueue.length > 0) {
      newPriorityQueue.push(tempMainQueue[0])
      tempMainQueue = tempMainQueue.slice(1)
    }
    setCashierQueues(newCashierQueues)
    setPriorityQueue(newPriorityQueue)
    setMainQueue(tempMainQueue)
  }, [mainQueue.length])

  const handleServe = (cashierIdx) => {
    setCashierQueues(prev => prev.map((cq, idx) =>
      idx === cashierIdx ? cq.slice(1) : cq
    ))
    setAssigned(prev => {
      const newAssigned = [...prev]
      if (cashierQueues[cashierIdx].length > 1) {
        newAssigned[cashierIdx] = cashierQueues[cashierIdx][1]
      } else {
        newAssigned[cashierIdx] = null
      }
      return newAssigned
    })
  }

  const handlePriorityServe = () => {
    setPriorityQueue(prev => prev.slice(1))
    setPriorityAssigned(null)
  }

  const isIdle = (idx) => !assigned[idx]
  const isPriorityIdle = () => !priorityAssigned

  useEffect(() => {
    cashierQueues.forEach((cq, idx) => {
      if (isIdle(idx) && cq.length > 0) {
        setAssigned(prev => {
          const newAssigned = [...prev]
          newAssigned[idx] = cq[0]
          return newAssigned
        })
      }
    })
  }, [cashierQueues])

  useEffect(() => {
    if (isPriorityIdle() && priorityQueue.length > 0) {
      setPriorityAssigned(priorityQueue[0])
    }
  }, [priorityQueue])

  const stealFromOther = () => {
    if (isPriorityIdle()) {
      const idx = cashierQueues.findIndex(q => q.length > 0)
      if (idx !== -1) {
        setCashierQueues(prev => prev.map((cq, i) =>
          i === idx ? cq.slice(1) : cq
        ))
        setPriorityQueue([cashierQueues[idx][0]])
        setAssigned(prev => {
          const newAssigned = [...prev]
          if (cashierQueues[idx].length > 1) {
            newAssigned[idx] = cashierQueues[idx][1]
          } else {
            newAssigned[idx] = null
          }
          return newAssigned
        })
      }
    }
  }

  return (
    <div className="queuemanager-container">
      <div className="queue-section">
        <CashierQueue
          queue={mainQueue}
          onAccept={handleAccept}
          onAcceptPriority={handleAcceptPriority}
          assigned={assigned.filter(Boolean).join(', ') || null}
        />
      </div>
      <div className="cashier-section">
        <PriorityCashier
          assigned={priorityAssigned}
          onServe={handlePriorityServe}
          isIdle={isPriorityIdle()}
          queue={priorityQueue}
          cashierId={0}
          stealFromOther={stealFromOther}
          className="priority-cashier-box"
        />
        <RegularCashier
          cashierQueue={cashierQueues[0]}
          onServe={() => handleServe(0)}
          isIdle={isIdle(0)}
          cashierId={0}
          assigned={assigned[0]}
          className="regular-cashier-box"
        />
        <RegularCashier
          cashierQueue={cashierQueues[1]}
          onServe={() => handleServe(1)}
          isIdle={isIdle(1)}
          cashierId={1}
          assigned={assigned[1]}
          className="regular-cashier-box"
        />
      </div>
    </div>
  )
}

export default QueueManager
