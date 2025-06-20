-- Create enum types for task status and priority
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'completed');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.budget_item_type AS ENUM ('expense', 'allocation');

-- Create tasks table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'todo',
    priority task_priority NOT NULL DEFAULT 'medium',
    assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create budget_items table
CREATE TABLE public.budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    type budget_item_type NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for tasks updated_at
CREATE TRIGGER set_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can view tasks in their projects" ON public.tasks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = tasks.project_id
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can create tasks" ON public.tasks
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = tasks.project_id
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can update tasks" ON public.tasks
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = tasks.project_id
            AND project_members.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = tasks.project_id
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can delete tasks" ON public.tasks
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = tasks.project_id
            AND project_members.user_id = auth.uid()
        )
    );

-- Create policies for budget_items
CREATE POLICY "Users can view budget items in their projects" ON public.budget_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = budget_items.project_id
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can create budget items" ON public.budget_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = budget_items.project_id
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can update their own budget items" ON public.budget_items
    FOR UPDATE
    USING (
        created_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = budget_items.project_id
            AND project_members.user_id = auth.uid()
        )
    )
    WITH CHECK (
        created_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = budget_items.project_id
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can delete their own budget items" ON public.budget_items
    FOR DELETE
    USING (
        created_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = budget_items.project_id
            AND project_members.user_id = auth.uid()
        )
    );

-- Create indexes for better query performance
CREATE INDEX tasks_project_id_idx ON public.tasks(project_id);
CREATE INDEX tasks_assignee_id_idx ON public.tasks(assignee_id);
CREATE INDEX tasks_status_idx ON public.tasks(status);
CREATE INDEX budget_items_project_id_idx ON public.budget_items(project_id);
CREATE INDEX budget_items_created_by_idx ON public.budget_items(created_by); 