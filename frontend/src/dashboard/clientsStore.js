import { useEffect, useState } from "react";
import { CLIENTS as SEED } from "./seedData";

// Module-level mutable store + simple pub/sub so AddClient updates propagate.
let _clients = [...SEED];
const _subs = new Set();

function notify() {
  for (const cb of _subs) cb([..._clients]);
}

export function getClients() {
  return _clients;
}

export function addClient(client) {
  const id = `c-${Math.random().toString(36).slice(2, 8)}`;
  const newClient = {
    id,
    name: client.name,
    age: Number(client.age) || 0,
    condition: client.condition || "Not specified",
    routesAssigned: 0,
    lastActive: new Date().toISOString().slice(0, 10),
    status: "active",
    notes: client.notes || "",
    viewCounts: {},
  };
  _clients = [newClient, ..._clients];
  notify();
  return newClient;
}

/**
 * Subscribe a React component to the clients store.
 */
export function useClients() {
  const [clients, setClients] = useState(_clients);
  useEffect(() => {
    _subs.add(setClients);
    return () => _subs.delete(setClients);
  }, []);
  return clients;
}
