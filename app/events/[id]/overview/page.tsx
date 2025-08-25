import { createClient } from '@/lib/supabase/server'

export default async function EventOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params
  const supabase = await createClient()

  const [{ data: event }, { data: tasks }, { data: docs }, { data: sched }, { data: incidents }] = await Promise.all([
    supabase.from('events_v2').select('id, org_id, title, status, start_at, end_at, timezone').eq('id', eventId).maybeSingle(),
    supabase.from('tasks').select('id, title, status, due_at').eq('event_id', eventId).order('due_at', { ascending: true }).limit(5),
    supabase.from('required_docs').select('id, kind, party, status, due_at').eq('event_id', eventId).order('due_at', { ascending: true }).limit(5),
    supabase.from('schedule_items').select('id, start_at, end_at, title, location').in('schedule_id',
      (await supabase.from('schedules').select('id').eq('event_id', eventId)).data?.map(s => s.id) || []
    ).order('start_at', { ascending: true }).limit(5),
    supabase.from('incidents').select('id, severity, title, created_at').eq('event_id', eventId).order('created_at', { ascending: false }).limit(5)
  ])

  if (!event) return <div className="max-w-4xl mx-auto p-6 text-slate-300">Event not found</div>

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">{event.title}</h1>
        <div className="text-slate-400">Status: {event.status} • {new Date(event.start_at).toLocaleString()} → {new Date(event.end_at).toLocaleString()} ({event.timezone})</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4">
          <h2 className="text-white font-semibold mb-2">Upcoming Tasks</h2>
          <ul className="space-y-2">
            {(tasks || []).map(t => (
              <li key={t.id} className="flex items-center justify-between text-slate-300 text-sm">
                <span>{t.title}</span>
                <span className="text-slate-500">{t.due_at ? new Date(t.due_at).toLocaleString() : ''}</span>
              </li>
            ))}
            {(!tasks || tasks.length === 0) && <li className="text-slate-500 text-sm">No tasks</li>}
          </ul>
        </section>

        <section className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4">
          <h2 className="text-white font-semibold mb-2">Missing Docs</h2>
          <ul className="space-y-2">
            {(docs || []).filter(d => d.status !== 'approved').map(d => (
              <li key={d.id} className="flex items-center justify-between text-slate-300 text-sm">
                <span>{d.kind} • {d.party} • {d.status}</span>
                <span className="text-slate-500">{d.due_at ? new Date(d.due_at).toLocaleDateString() : ''}</span>
              </li>
            ))}
            {(!docs || docs.length === 0) && <li className="text-slate-500 text-sm">No required docs</li>}
          </ul>
        </section>

        <section className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4">
          <h2 className="text-white font-semibold mb-2">Next Schedule Items</h2>
          <ul className="space-y-2">
            {(sched || []).map(s => (
              <li key={s.id} className="flex items-center justify-between text-slate-300 text-sm">
                <span>{s.title}</span>
                <span className="text-slate-500">{new Date(s.start_at).toLocaleTimeString()}–{new Date(s.end_at).toLocaleTimeString()}</span>
              </li>
            ))}
            {(!sched || sched.length === 0) && <li className="text-slate-500 text-sm">No schedule items</li>}
          </ul>
        </section>

        <section className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4">
          <h2 className="text-white font-semibold mb-2">Recent Incidents</h2>
          <ul className="space-y-2">
            {(incidents || []).map(i => (
              <li key={i.id} className="flex items-center justify-between text-slate-300 text-sm">
                <span>{i.severity} • {i.title}</span>
                <span className="text-slate-500">{new Date(i.created_at).toLocaleString()}</span>
              </li>
            ))}
            {(!incidents || incidents.length === 0) && <li className="text-slate-500 text-sm">No incidents</li>}
          </ul>
        </section>
      </div>
    </div>
  )
}


