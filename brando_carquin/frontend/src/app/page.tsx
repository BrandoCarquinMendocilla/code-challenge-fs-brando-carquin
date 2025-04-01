"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import { Tab, Tabs } from "react-bootstrap";
import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from "@mui/x-charts";
import { Card, CardContent } from '@mui/material';
import { PhoneCall, Clock, Activity, Users } from "lucide-react";


const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
});

export default function CallStatusDashboard() {
  const [calls, setCalls] = useState<{ id: string; status: string; queueId: string; startTime: string; endTime?: string }[]>([]);
  const [events, setEvents] = useState<{ values: number[],seconds: number[], key: string[], callInProgress: number, totalCalls: number, compliance: string, second: string, eventHistory: { timestamp: string; id: string; type: string, callId: string }[] }>();
  const [statusFilter, setStatusFilter] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("");
  const [callIdFilter, setCallIdFilter] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("calls");

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchCalls();
  }, [statusFilter]);

  const fetchCalls = async () => {
    const url = statusFilter
      ? `http://localhost:3000/calls?status=${statusFilter}`
      : "http://localhost:3000/calls";
    try {
      const response = await fetch(url);
      const data = await response.json();
      setCalls(data);
    } catch (error) {
      console.error("Error fetching calls:", error);
    }
  };

  const fetchEvents = async () => {
    const url = new URL("http://localhost:3000/api/events");

    if (historyStatusFilter) url.searchParams.append("status", historyStatusFilter);
    if (callIdFilter) url.searchParams.append("call_id", callIdFilter);

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
      });

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Conectado al servidor WebSocket");
      fetchEvents();
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Desconectado del servidor WebSocket");
      setIsConnected(false);
    });

    const handleCallUpdate = (data: { id: string; status: string; queueId: string; startTime: string; endTime?: string }) => {
      console.log("Evento recibido:", data);
      if (!data.id) return;

      setCalls((prevCalls) => {
        const updatedCalls = prevCalls.map((call) =>
          call.id === data.id ? { ...call, status: data.status, queueId: data.queueId, startTime: data.startTime, endTime: data.endTime } : call
        );

        if (!updatedCalls.some(call => call.id === data.id)) {
          updatedCalls.push({ id: data.id, status: data.status, queueId: data.queueId, startTime: data.startTime, endTime: data.endTime });
        }

        return [...updatedCalls];
      });
      fetchEvents();
    };

    socket.on("call_created", handleCallUpdate);
    socket.on("call_update", handleCallUpdate);

    return () => {
      socket.off("call_created", handleCallUpdate);
      socket.off("call_update", handleCallUpdate);
    };
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      fetchEvents();
    }
  }, [activeTab, historyStatusFilter, callIdFilter]);

  const data = events?.values ?? [];
  const dataSeconds = events?.seconds ?? [];

  const parameters = events?.key ?? [];


  const stats = [
    { icon: <PhoneCall size={32} style={{ color: "#3B82F6" }} />, label: "Active Calls", value:  events?.callInProgress ?? '0', backgroundColor: "#DBEAFF" },
    { icon: <Clock size={32} style={{ color: "#FACC15" }} />, label: "Avg. Wait Time", value: events?.second ?? '0s', backgroundColor: "#FFF9DB" },
    { icon: <Activity size={32} style={{ color: "#22C55E" }} />, label: "SLA Compliance", value: events?.compliance ?? '0%', backgroundColor: "#D1F7D1" },
    { icon: <Users size={32} style={{ color: "#A855F7" }} />, label: "Total Calls Today", value:  events?.totalCalls ?? '0', backgroundColor: "#F2E0FF" },
  ];

  return (

    <div style={{ margin: '10px', padding: '20px 5%', backgroundColor: '#F9FAFC' }}>
      <div style={{ marginBottom: "24px", justifyContent: "left", paddingTop: '20px' }}><h1>Call Center Analytics Dashboard</h1> </div>
      <div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: '2em' }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
            {stats.map((stat, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", backgroundColor: "white", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", borderRadius: "12px", padding: "16px", width: "220px" }}>
                <div style={{ padding: "12px", borderRadius: "50%", backgroundColor: stat.backgroundColor }}>
                  {stat.icon}
                </div>                <div style={{ marginLeft: "16px" }}>
                  <p style={{ color: "#6B7280", fontSize: "14px" }}>{stat.label}</p>
                  <p style={{ fontSize: "20px", fontWeight: "600" }}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", paddingBottom: '2em' }}>
          <div style={{ display: 'flex', flexWrap: "wrap", gap: '16px', paddingBottom: '2em', alignSelf: 'center' }}>
            <div >
              <Card sx={{ alignItems: "center", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", borderRadius: "12px" }}>
                <CardContent>
                  <div style={{ justifySelf: 'left' }} ><b>Call Volume</b></div>
                  <BarChart
                    xAxis={[{ scaleType: 'band', data: parameters }]}
                    series={[{ data: data, color: '#3B81F6' }]}
                    width={360}
                    height={350}
                    grid={{ vertical: true, horizontal: true }}
                  />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card sx={{ alignItems: "center", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", borderRadius: "12px" }}>
                <CardContent>
                  <div style={{ justifySelf: 'left' }} ><b>Average Wait Time Volume (Second)</b></div>
                  <LineChart
                    width={360}
                    height={350}
                    series={[
                      { data: dataSeconds, color: '#E4A634' },
                    ]}
                    xAxis={[{ scaleType: 'point', data: parameters }]}
                    grid={{ vertical: true, horizontal: true }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className={isConnected ? "text-success" : "text-danger"}>WebSocket: {isConnected ? "Conectado" : "Desconectado"}</p>

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || "calls")} className="mb-3">
          <Tab eventKey="calls" title="Estado de Llamadas">
            <div className="mb-3">
              <label className="form-label">Filtrar por Estado:</label>
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Todos</option>
                <option value="waiting">En espera</option>
                <option value="initiated">Iniciada</option>
                <option value="routed">Enrutada</option>
                <option value="active">Activa</option>
                <option value="on_hold">En espera</option>
                <option value="ended">Finalizada</option>
              </select>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-primary">
                  <tr>
                    <th>Call ID</th>
                    <th>Estado</th>
                    <th>Código de Cola</th>
                    <th>Fecha-Hora Inicio</th>
                    <th>Fecha-Hora Fin</th>
                  </tr>
                </thead>
                <tbody>
                  {calls.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center">No hay llamadas activas</td>
                    </tr>
                  ) : (
                    calls.map((call) => (
                      <tr key={call.id}>
                        <td>{call.id}</td>
                        <td className="text-capitalize">{call.status.replace("_", " ")}</td>
                        <td className="text-capitalize">{call.queueId.replace("_", " ")}</td>
                        <td>{call.startTime}</td>
                        <td>{call.endTime || "En curso"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Tab>

          <Tab eventKey="history" title="Historial de Eventos">
            <div className="mb-3">
              <label className="form-label">Filtrar por Cola:</label>
              <select className="form-select" value={historyStatusFilter} onChange={(e) => setHistoryStatusFilter(e.target.value)}>
                <option value="">Todos</option>
                <option value="call_initiated">Llamada Iniciada</option>
                <option value="call_routed">Llamada Enrutada</option>
                <option value="call_answered">Llamada Activa</option>
                <option value="call_hold">Llamada En espera</option>
                <option value="call_ended">Llamada Finalizada</option>
                <option value="call_retransfer">Llamada Transferida</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Filtrar por Call ID:</label>
              <input type="text" className="form-control" value={callIdFilter} onChange={(e) => setCallIdFilter(e.target.value)} />
            </div>

            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-primary">
                  <tr>
                    <th>ID</th>
                    <th>Call ID</th>
                    <th>Estado</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {events?.eventHistory?.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center">No hay eventos recientes</td>
                    </tr>
                  ) : (
                    events?.eventHistory?.map((event, index) => (
                      <tr key={index}>
                        <td>{event.id}</td>
                        <td>{event.callId}</td>
                        <td className="text-capitalize">{event.type.replace("_", " ")}</td>
                        <td>{event.timestamp}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
