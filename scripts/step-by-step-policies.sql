-- Step-by-Step Site Map Policies
-- Run this AFTER the tables are created

-- STEP 1: Drop any existing policies to avoid conflicts
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on site map related tables
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'site_maps', 'site_map_zones', 'glamping_tents', 'site_map_elements',
            'site_map_collaborators', 'site_map_activity_log', 'equipment_catalog',
            'equipment_instances', 'equipment_setup_workflows', 'equipment_setup_tasks',
            'power_distribution', 'equipment_power_connections'
        )
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
        RAISE NOTICE 'Dropped policy % on table %', r.policyname, r.tablename;
    END LOOP;
END $$;

-- STEP 2: Create helper function for updating timestamps
CREATE OR REPLACE FUNCTION update_site_map_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 3: Create triggers for updated_at timestamps
CREATE TRIGGER trigger_update_site_maps_updated_at
    BEFORE UPDATE ON site_maps
    FOR EACH ROW
    EXECUTE FUNCTION update_site_map_updated_at();

CREATE TRIGGER trigger_update_site_map_zones_updated_at
    BEFORE UPDATE ON site_map_zones
    FOR EACH ROW
    EXECUTE FUNCTION update_site_map_updated_at();

CREATE TRIGGER trigger_update_glamping_tents_updated_at
    BEFORE UPDATE ON glamping_tents
    FOR EACH ROW
    EXECUTE FUNCTION update_site_map_updated_at();

CREATE TRIGGER trigger_update_site_map_elements_updated_at
    BEFORE UPDATE ON site_map_elements
    FOR EACH ROW
    EXECUTE FUNCTION update_site_map_updated_at();

CREATE TRIGGER trigger_update_site_map_collaborators_updated_at
    BEFORE UPDATE ON site_map_collaborators
    FOR EACH ROW
    EXECUTE FUNCTION update_site_map_updated_at();

CREATE TRIGGER trigger_update_equipment_catalog_updated_at
    BEFORE UPDATE ON equipment_catalog
    FOR EACH ROW
    EXECUTE FUNCTION update_site_map_updated_at();

CREATE TRIGGER trigger_update_equipment_instances_updated_at
    BEFORE UPDATE ON equipment_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_site_map_updated_at();

CREATE TRIGGER trigger_update_equipment_setup_workflows_updated_at
    BEFORE UPDATE ON equipment_setup_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_site_map_updated_at();

CREATE TRIGGER trigger_update_equipment_setup_tasks_updated_at
    BEFORE UPDATE ON equipment_setup_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_site_map_updated_at();

CREATE TRIGGER trigger_update_power_distribution_updated_at
    BEFORE UPDATE ON power_distribution
    FOR EACH ROW
    EXECUTE FUNCTION update_site_map_updated_at();

CREATE TRIGGER trigger_update_equipment_power_connections_updated_at
    BEFORE UPDATE ON equipment_power_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_site_map_updated_at();

-- STEP 4: Create RLS policies for core site map tables

-- Site maps policies
CREATE POLICY "Users can view public site maps" ON site_maps
    FOR SELECT USING (is_public = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own site maps" ON site_maps
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Collaborators can view site maps" ON site_maps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM site_map_collaborators 
            WHERE site_map_id = id AND user_id = auth.uid() AND is_active = true
        )
    );

-- Site map zones policies
CREATE POLICY "Users can view zones for accessible site maps" ON site_map_zones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM site_maps 
            WHERE id = site_map_id AND (
                auth.uid() = created_by OR
                EXISTS (
                    SELECT 1 FROM site_map_collaborators 
                    WHERE site_map_id = site_maps.id AND user_id = auth.uid() AND is_active = true
                )
            )
        )
    );

CREATE POLICY "Collaborators can manage zones" ON site_map_zones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM site_map_collaborators 
            WHERE site_map_id = site_map_zones.site_map_id 
            AND user_id = auth.uid() 
            AND is_active = true 
            AND can_edit = true
        )
    );

-- Glamping tents policies
CREATE POLICY "Users can view tents for accessible site maps" ON glamping_tents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM site_maps 
            WHERE id = site_map_id AND (
                auth.uid() = created_by OR
                EXISTS (
                    SELECT 1 FROM site_map_collaborators 
                    WHERE site_map_id = site_maps.id AND user_id = auth.uid() AND is_active = true
                )
            )
        )
    );

CREATE POLICY "Collaborators can manage tents" ON glamping_tents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM site_map_collaborators 
            WHERE site_map_id = glamping_tents.site_map_id 
            AND user_id = auth.uid() 
            AND is_active = true 
            AND can_edit = true
        )
    );

-- Site map elements policies
CREATE POLICY "Users can view elements for accessible site maps" ON site_map_elements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM site_maps 
            WHERE id = site_map_id AND (
                auth.uid() = created_by OR
                EXISTS (
                    SELECT 1 FROM site_map_collaborators 
                    WHERE site_map_id = site_maps.id AND user_id = auth.uid() AND is_active = true
                )
            )
        )
    );

CREATE POLICY "Collaborators can manage elements" ON site_map_elements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM site_map_collaborators 
            WHERE site_map_id = site_map_elements.site_map_id 
            AND user_id = auth.uid() 
            AND is_active = true 
            AND can_edit = true
        )
    );

-- Site map collaborators policies
CREATE POLICY "Users can view collaborators for accessible site maps" ON site_map_collaborators
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM site_maps 
            WHERE id = site_map_id AND (
                auth.uid() = created_by OR
                EXISTS (
                    SELECT 1 FROM site_map_collaborators smc
                    WHERE smc.site_map_id = site_maps.id AND smc.user_id = auth.uid() AND smc.is_active = true
                )
            )
        )
    );

CREATE POLICY "Collaborators can manage collaborators" ON site_map_collaborators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM site_map_collaborators smc
            WHERE smc.site_map_id = site_map_collaborators.site_map_id 
            AND smc.user_id = auth.uid() 
            AND smc.is_active = true 
            AND smc.can_edit = true
        )
    );

-- Site map activity log policies
CREATE POLICY "Users can view activity log for accessible site maps" ON site_map_activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM site_maps 
            WHERE id = site_map_id AND (
                auth.uid() = created_by OR
                EXISTS (
                    SELECT 1 FROM site_map_collaborators 
                    WHERE site_map_id = site_maps.id AND user_id = auth.uid() AND is_active = true
                )
            )
        )
    );

-- STEP 5: Create RLS policies for equipment tables

-- Equipment catalog policies
CREATE POLICY "Users can view equipment catalog" ON equipment_catalog
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own equipment" ON equipment_catalog
    FOR ALL USING (auth.uid() = created_by);

-- Equipment instances policies
CREATE POLICY "Users can view equipment instances for accessible site maps" ON equipment_instances
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM site_maps 
            WHERE id = site_map_id AND (
                auth.uid() = created_by OR
                EXISTS (
                    SELECT 1 FROM site_map_collaborators 
                    WHERE site_map_id = site_maps.id AND user_id = auth.uid() AND is_active = true
                )
            )
        )
    );

CREATE POLICY "Collaborators can manage equipment instances" ON equipment_instances
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM site_map_collaborators 
            WHERE site_map_id = equipment_instances.site_map_id 
            AND user_id = auth.uid() 
            AND is_active = true 
            AND can_edit = true
        )
    );

-- Setup workflows policies
CREATE POLICY "Users can view workflows for accessible site maps" ON equipment_setup_workflows
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM site_maps 
            WHERE id = site_map_id AND (
                auth.uid() = created_by OR
                EXISTS (
                    SELECT 1 FROM site_map_collaborators 
                    WHERE site_map_id = site_maps.id AND user_id = auth.uid() AND is_active = true
                )
            )
        )
    );

CREATE POLICY "Collaborators can manage workflows" ON equipment_setup_workflows
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM site_map_collaborators 
            WHERE site_map_id = equipment_setup_workflows.site_map_id 
            AND user_id = auth.uid() 
            AND is_active = true 
            AND can_edit = true
        )
    );

-- Setup tasks policies
CREATE POLICY "Users can view tasks for accessible workflows" ON equipment_setup_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM equipment_setup_workflows ew
            JOIN site_maps sm ON ew.site_map_id = sm.id
            WHERE ew.id = workflow_id AND (
                auth.uid() = sm.created_by OR
                EXISTS (
                    SELECT 1 FROM site_map_collaborators 
                    WHERE site_map_id = sm.id AND user_id = auth.uid() AND is_active = true
                )
            )
        )
    );

CREATE POLICY "Collaborators can manage tasks" ON equipment_setup_tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM equipment_setup_workflows ew
            JOIN site_map_collaborators smc ON ew.site_map_id = smc.site_map_id
            WHERE ew.id = workflow_id 
            AND smc.user_id = auth.uid() 
            AND smc.is_active = true 
            AND smc.can_edit = true
        )
    );

-- Power distribution policies
CREATE POLICY "Users can view power distribution for accessible site maps" ON power_distribution
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM site_maps 
            WHERE id = site_map_id AND (
                auth.uid() = created_by OR
                EXISTS (
                    SELECT 1 FROM site_map_collaborators 
                    WHERE site_map_id = site_maps.id AND user_id = auth.uid() AND is_active = true
                )
            )
        )
    );

CREATE POLICY "Collaborators can manage power distribution" ON power_distribution
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM site_map_collaborators 
            WHERE site_map_id = power_distribution.site_map_id 
            AND user_id = auth.uid() 
            AND is_active = true 
            AND can_edit = true
        )
    );

-- Power connections policies
CREATE POLICY "Users can view power connections for accessible equipment" ON equipment_power_connections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM equipment_instances ei
            JOIN site_maps sm ON ei.site_map_id = sm.id
            WHERE ei.id = equipment_instance_id AND (
                auth.uid() = sm.created_by OR
                EXISTS (
                    SELECT 1 FROM site_map_collaborators 
                    WHERE site_map_id = sm.id AND user_id = auth.uid() AND is_active = true
                )
            )
        )
    );

CREATE POLICY "Collaborators can manage power connections" ON equipment_power_connections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM equipment_instances ei
            JOIN site_map_collaborators smc ON ei.site_map_id = smc.site_map_id
            WHERE ei.id = equipment_instance_id 
            AND smc.user_id = auth.uid() 
            AND smc.is_active = true 
            AND smc.can_edit = true
        )
    );

-- STEP 6: Create helper functions
CREATE OR REPLACE FUNCTION get_site_map_with_data(site_map_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'site_map', to_jsonb(sm.*),
        'zones', COALESCE(
            (SELECT jsonb_agg(to_jsonb(sz.*))
             FROM site_map_zones sz
             WHERE sz.site_map_id = sm.id),
            '[]'::jsonb
        ),
        'tents', COALESCE(
            (SELECT jsonb_agg(to_jsonb(gt.*))
             FROM glamping_tents gt
             WHERE gt.site_map_id = sm.id),
            '[]'::jsonb
        ),
        'elements', COALESCE(
            (SELECT jsonb_agg(to_jsonb(sme.*))
             FROM site_map_elements sme
             WHERE sme.site_map_id = sm.id),
            '[]'::jsonb
        ),
        'collaborators', COALESCE(
            (SELECT jsonb_agg(to_jsonb(smc.*))
             FROM site_map_collaborators smc
             WHERE smc.site_map_id = sm.id AND smc.is_active = true),
            '[]'::jsonb
        )
    ) INTO result
    FROM site_maps sm
    WHERE sm.id = site_map_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_edit_site_map(site_map_uuid UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM site_maps sm
        LEFT JOIN site_map_collaborators smc ON sm.id = smc.site_map_id AND smc.user_id = user_uuid AND smc.is_active = true
        WHERE sm.id = site_map_uuid
        AND (sm.created_by = user_uuid OR smc.can_edit = true)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_tent_availability(site_map_uuid UUID, check_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    tent_id UUID,
    tent_number VARCHAR,
    tent_type VARCHAR,
    status VARCHAR,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gt.id,
        gt.tent_number,
        gt.tent_type,
        gt.status,
        CASE 
            WHEN gt.status = 'available' 
                AND (gt.check_in_date IS NULL OR gt.check_in_date > check_date)
                AND (gt.check_out_date IS NULL OR gt.check_out_date <= check_date)
            THEN true
            ELSE false
        END as is_available
    FROM glamping_tents gt
    WHERE gt.site_map_id = site_map_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 'Site map system policies and functions created successfully!' as message;
