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

  const removePriorityQueueCustomer = (idx) => {
  setPriorityQueue(prev => prev.filter((_, i) => i !== idx))
}

// Remove the currently assigned customer in priority cashier
const removePriorityAssigned = () => {
  setPriorityAssigned(null)
  setPriorityQueue(prev => prev.slice(1)) // move to next in line, if any
}

// Remove customer from a regular cashier queue (by index)
const removeRegularQueueCustomer = (cashierIdx, customerIdx) => {
  setCashierQueues(prev => prev.map((cq, idx) =>
    idx === cashierIdx ? cq.filter((_, i) => i !== customerIdx) : cq
  ))
}

// Remove the currently assigned customer for a specific regular cashier
const removeRegularAssigned = (cashierIdx) => {
  setAssigned(prev => {
    const newAssigned = [...prev]
    newAssigned[cashierIdx] = null
    return newAssigned
  })

  setCashierQueues(prev => prev.map((cq, idx) => {
    if (idx !== cashierIdx) return cq
    return cq.slice(1) // shift to next customer
  }))
}

  const handleServe = (cashierIdx) => {
  setCashierQueues(prev => {
    const newQueues = prev.map((cq, idx) =>
      idx === cashierIdx ? cq.slice(1) : cq
    )

    // Delay setting assigned so it doesn't overlap with useEffect
    setTimeout(() => {
      setAssigned(prev => {
        const newAssigned = [...prev]
        const newQueue = newQueues[cashierIdx]
        newAssigned[cashierIdx] = newQueue.length > 0 ? newQueue[0] : null
        return newAssigned
      })
    }, 0)

    return newQueues
  })
}

  const handlePriorityServe = () => {
  setPriorityQueue(prev => {
    const nextQueue = prev.slice(1)
    setTimeout(() => {
      if (nextQueue.length > 0) {
        setPriorityAssigned(nextQueue[0])
      } else {
        setPriorityAssigned(null)
      }
    }, 0)
    return nextQueue
  })
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
      const stolenCustomer = cashierQueues[idx][0]  // ✅ capture customer before modifying queue

      setCashierQueues(prev => prev.map((cq, i) =>
        i === idx ? cq.slice(1) : cq
      ))

      setPriorityQueue(prev => [...prev, stolenCustomer]) // ✅ append to existing priority queue
      setPriorityAssigned(stolenCustomer) // ✅ assign immediately

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

useEffect(() => {
  if (isPriorityIdle() && priorityQueue.length === 0) {
    const updatedCashierQueues = [...cashierQueues]
    const customersToSteal = []

    let i = 0
    while (customersToSteal.length < 5) {
      let found = false

      for (let cashierIdx = 0; cashierIdx < updatedCashierQueues.length; cashierIdx++) {
        const queue = updatedCashierQueues[cashierIdx]

        if (queue.length > 0) {
          customersToSteal.push(queue[0])
          updatedCashierQueues[cashierIdx] = queue.slice(1)
          found = true

          if (customersToSteal.length === 5) break
        }
      }

      if (!found) break 
      i++
    }

    if (customersToSteal.length > 0) {
      setCashierQueues(updatedCashierQueues)
      setPriorityQueue(customersToSteal)
      setPriorityAssigned(customersToSteal[0])

      
      setAssigned(updatedCashierQueues.map(q => (q.length > 0 ? q[0] : null)))
    }
  }
}, [assigned, priorityAssigned, cashierQueues, priorityQueue])

const handleAssignOne = () => {
  if (mainQueue.length === 0) return;

  const availableIndex = cashierQueues.findIndex(queue => queue.length < 5);

  if (availableIndex !== -1) {
    setCashierQueues(prevQueues =>
      prevQueues.map((queue, i) =>
        i === availableIndex ? [...queue, mainQueue[0]] : queue
      )
    );

    setMainQueue(prevMainQueue => prevMainQueue.slice(1));
  }
};

  const handleAssignAll = () => {
    let tempMainQueue = [...mainQueue]
    const newCashierQueues = cashierQueues.map((cq) => {
      let newCQ = [...cq]
      while (newCQ.length < 5 && tempMainQueue.length > 0) {
        newCQ.push(tempMainQueue[0])
        tempMainQueue = tempMainQueue.slice(1)
      }
      return newCQ
    })
    setCashierQueues(newCashierQueues)
    setMainQueue(tempMainQueue)
  }

  return (
  <div className="queuemanager-container">
    <div className="queue-section">
      <CashierQueue
        queue={mainQueue}
        onAccept={handleAccept}
        onAcceptPriority={handleAcceptPriority}
        assigned={assigned.filter(Boolean).join(', ') || null}
        onAssignOne={handleAssignOne}
        onAssignAll={handleAssignAll}
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
        onRemoveFromQueue={removePriorityQueueCustomer}
        onRemoveAssigned={removePriorityAssigned}
        className="priority-cashier-box"
      />
      <RegularCashier
        cashierQueue={cashierQueues[0]}
        onServe={() => handleServe(0)}
        isIdle={isIdle(0)}
        cashierId={0}
        assigned={assigned[0]}
        onRemoveFromQueue={(idx) => removeRegularQueueCustomer(0, idx)}
        onRemoveAssigned={() => removeRegularAssigned(0)}
        className="regular-cashier-box"
      />
      <RegularCashier
        cashierQueue={cashierQueues[1]}
        onServe={() => handleServe(1)}
        isIdle={isIdle(1)}
        cashierId={1}
        assigned={assigned[1]}
        onRemoveFromQueue={(idx) => removeRegularQueueCustomer(1, idx)}
        onRemoveAssigned={() => removeRegularAssigned(1)}
        className="regular-cashier-box"
      />
    </div>
  </div>
)
}

export default QueueManager;
