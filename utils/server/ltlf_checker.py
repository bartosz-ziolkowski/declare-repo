#!/usr/bin/env python3

import sys
import json
import argparse
from Declare4Py.ProcessModels.DeclareModel import DeclareModel
from Declare4Py.ProcessModels.LTLModel import LTLModel, LTLTemplate
from ltlf2dfa.parser.ltlf import LTLfParser
from datetime import datetime
import traceback
import requests
import os
import re 
from automata.fa.dfa import DFA

def download_model(url: str) -> str:
    """
    Download the model file from the given URL
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.text
    except Exception as e:
        raise

def parse_declare_constraint(constraint_str: str) -> tuple:
    """
    Parse a Declare constraint string into its components
    Returns (template_name, activities_list, conditions)
    """
    try:
        # Split into template and conditions
        template_part, *conditions = constraint_str.split('|')
        
        # Parse template part
        template_name = template_part[:template_part.find('[')].strip()
        activities_str = template_part[template_part.find('[')+1:template_part.find(']')]
        
        # Parse activities
        activities = [act.strip() for act in activities_str.split(',')]
        
        # Parse conditions (removing empty conditions)
        conditions = [cond.strip() for cond in conditions if cond.strip()]
        
        return template_name, activities, conditions
    except Exception as e:
        return None, None, None

def create_ltl_formula(template_name: str, activities: list) -> LTLModel:
    """
    Creates LTL formula using both LTLModel methods and LTLTemplate when needed
    """
    model = LTLModel()
    activities = [format_activity_name(act) for act in activities]
    
    try:
        if template_name == "Init":
            # CORRECT
            model.parse_from_string(activities[0])
            
        elif template_name == "Existence":
            # CORRECT
            model.parse_from_string(activities[0])
            model.add_eventually()
            
        elif template_name == "Absence":
            # correct
            model.parse_from_string(activities[0])
            model.add_eventually()
            model.add_negation()

        elif template_name == "Absence2":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('absence_twice')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)

        elif template_name == "Absence3":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('absence_triple')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)
            
        elif template_name == "Exactly1":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('exactly_once')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)

        elif template_name == "Exactly2":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('exactly_twice')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)

        elif template_name == "Existence2":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('existence_twice')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)

        elif template_name == "Existence3":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('existence_triple')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)
            
        # Binary templates using LTLModel methods
        elif template_name == "Response":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('response')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)
            
        elif template_name == "Chain Response":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('chain_response')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)
            
        elif template_name == "Alternate Response":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('alternate_response')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)

        elif template_name == "Responded Existence":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('responded_existence')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)

        elif template_name == "Precedence":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('precedence')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)
            
        elif template_name == "Alternate Precedence":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('alternate_precedence')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)
            
        elif template_name == "Chain Precedence":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('chain_precedence')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)
            
        # Succession templates (combinations)
        elif template_name == "Succession":
            # correct
            response_model = create_ltl_formula("Response", activities)
            precedence_model = create_ltl_formula("Precedence", activities)
            model.parse_from_string(response_model.formula)
            model.add_conjunction(precedence_model.formula)
            
        elif template_name == "Alternate Succession":
            # correct
            alt_response_model = create_ltl_formula("Alternate Response", activities)
            alt_precedence_model = create_ltl_formula("Alternate Precedence", activities)
            model.parse_from_string(alt_response_model.formula)
            model.add_conjunction(alt_precedence_model.formula)
            
        # Choice templates
        elif template_name == "Choice":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('eventually_a_or_b')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)
            
        elif template_name == "Exclusive Choice":
            # correct
            choice_template = LTLTemplate('eventually_a_or_b')
            not_coexist_template = LTLTemplate('not_coexistence')
            model.parse_from_string(choice_template.fill_template(activities).formula)
            model.add_conjunction(not_coexist_template.fill_template(activities).formula)
        
        elif template_name == "Not Chain Precedence":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('not_chain_precedence')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)
        
        elif template_name == "Not Chain Response":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('not_chain_response')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)
        
        elif template_name == "Not Precedence":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('not_precedence')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)
        
        elif template_name == "Not Responded Existence":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('not_responded_existence')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)

        elif template_name == "Not Response":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('not_response')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)

        elif template_name == "Not Co-Existence":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('not_coexistence')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)
                
        elif template_name == "Not Succession":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('not_succession')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)
        
        elif template_name == "Co-Existence":
            # correct
            implies_b_template = LTLTemplate('eventually_a_implies_eventually_b')
            implies_a_template = LTLTemplate('eventually_b_implies_eventually_a')
            model.parse_from_string(implies_b_template.fill_template(activities).formula)
            model.add_conjunction(implies_a_template.fill_template(activities).formula)
        
        elif template_name == "Not Chain Succession":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('not_chain_succession')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)  

        elif template_name == "Chain Succession":
            # correct
            activation = [activities[0]]
            target = [activities[1]]
            template = LTLTemplate('chain_succession')
            temp_model = template.fill_template(activation, target)
            model.parse_from_string(temp_model.formula)     
            
        return model
        
    except Exception as e:
        return None
    
def format_activity_name(activity: str) -> str:
    """Format activity name for LTL formula.

    This ensures the activity name:
    - Contains only valid characters (letters, digits, and underscores).
    - Starts with a letter or underscore.
    - Removes illegal characters.

    Args:
        activity (str): The original activity name.

    Returns:
        str: A formatted activity name compliant with LTL formula standards.
    """
    formatted = activity.replace(" ", "").lower()
    formatted = re.sub(r'[^a-z0-9_]', '', formatted)
    
    if not re.match(r'^[a-z_]', formatted):
        formatted = f"_{formatted}"
    
    return formatted



def check_semantical_redundacy(ltlf_formulas: list, original_model: LTLModel) -> any:
    parser = LTLfParser()
    original_model_formula = original_model.formula.replace("[!]", "")
    parsed_original_model_formula = parser(original_model_formula)
    original_dfa = parsed_original_model_formula.to_dfa()

    base_filename = 'original_dfa'
    filename = base_filename + '.txt'
    count = 1

    redundant_cons = []

    while os.path.exists(os.path.join('dfas', filename)):
        filename = f'{base_filename}_{count}.txt'
        count += 1
    filepath = os.path.join('dfas', filename)
    with open(filepath, 'w') as f:
        f.write(original_dfa)

    og_states, og_input_symbols, og_transitions, og_initial_state, og_final_states = convert_dfa_file(filename)

    og_dfa = DFA(
        states=og_states,
        input_symbols=og_input_symbols,
        transitions=og_transitions,
        initial_state=og_initial_state,
        final_states=og_final_states,
        allow_partial=True
    )

    os.remove(filepath)

    for i, current_formula in enumerate(ltlf_formulas):
        combined_model = LTLModel()
        first = True
        
        for j, other_formula in enumerate(ltlf_formulas):
            if i != j: 
                if first:
                    combined_model.parse_from_string(other_formula['formula'])
                    first = False
                else:
                    combined_model.add_conjunction(other_formula['formula'])
        
        combined_model_formula = combined_model.formula.replace("[!]", "")
        parsed_combined_model_formula = parser(combined_model_formula)

        combined_dfa = parsed_combined_model_formula.to_dfa()

        base_filename = 'combined_dfa'
        filename = base_filename + '.txt'
        count = 1

        while os.path.exists(os.path.join('dfas', filename)):
            filename = f'{base_filename}_{count}.txt'
            count += 1
        filepath = os.path.join('dfas', filename)
        with open(filepath, 'w') as f:
            f.write(combined_dfa)

        com_states, com_input_symbols, com_transitions, com_initial_state, com_final_states = convert_dfa_file(filename)

        com_dfa = DFA(
            states=com_states,
            input_symbols=com_input_symbols,
            transitions=com_transitions,
            initial_state=com_initial_state,
            final_states=com_final_states,
            allow_partial=True
        )

        os.remove(filepath)

        if(og_dfa == com_dfa):
            redundant_cons.append(current_formula)
        
    redundant_cons = list(set(redundant_cons))
    return redundant_cons
        
def convert_dfa_file(filename):
    with open(os.path.join('dfas', filename), 'r') as file:
        content = file.read()
    
    states = set()
    input_symbols = set()
    transitions = {}
    initial_state = ''
    final_states = set()
    
    # Get initial state
    init_match = re.search(r'init -> (\d+);', content)
    if init_match:
        initial_state = init_match.group(1)
    
    # Get final states
    final_states_match = re.findall(r'node \[shape = doublecircle\]; (\d+);', content)
    final_states.update(final_states_match)
    
    # Get all transitions and build states and input_symbols sets
    transition_pattern = r'(\d+) -> (\d+) \[label="([^"]+)"\];'
    transitions_matches = re.findall(transition_pattern, content)
    
    # Process transitions
    for from_state, to_state, label in transitions_matches:
        states.add(from_state)
        states.add(to_state)
        
        # Initialize transitions dictionary for the from_state if not exists
        if from_state not in transitions:
            transitions[from_state] = {}
            
        # Add the transition
        transitions[from_state][label] = to_state
        input_symbols.add(label)
    
    return states, input_symbols, transitions, initial_state, final_states       

def analyze_declare_model(model_path: str) -> dict:
    """
    Analyze a Declare model and check its satisfiability
    """
    try:       
        # Download model if it's a URL
        if model_path.startswith('http'):
            model_content = download_model(model_path)
    
            # Define paths
            existing_temp_path = '/tmp/temp_model.decl'
    
            if os.path.exists(existing_temp_path):
                # Create new file with timestamp
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                temp_path = f'/tmp/temp_model_{timestamp}.decl'
                with open(temp_path, 'w') as f:
                    f.write(model_content)
            else:
                # Save to original temp path
                temp_path = existing_temp_path
                with open(temp_path, 'w') as f:
                    f.write(model_content)
    
            model_path = temp_path

        # Parse Declare model
        declare_model = DeclareModel()
        declare_model.parse_from_file(model_path)
        
        # Get activities and constraints
        model_activities = declare_model.get_model_activities()
        model_constraints = declare_model.get_decl_model_constraints()
        
        # Create main LTL model for final result
        ltl_model = LTLModel()
        ltl_formulas = []
 
        # Process each constraint
        for constraint in model_constraints:
            template_name, activities, *_ = parse_declare_constraint(constraint)
            
            if not template_name:
                continue
            
            # Create LTL formula using template
            constraint_model = create_ltl_formula(template_name, activities)

            if constraint_model and constraint_model.formula:
                ltl_formulas.append({
                    'template': template_name,
                    'activities': activities,
                    'formula': constraint_model.formula
                })
        
        for idx, formula_dict in enumerate(ltl_formulas):
            if idx == 0:
                ltl_model.parse_from_string(formula_dict['formula'])
            else:
                ltl_model.add_conjunction(formula_dict['formula'])
        
        # Check satisfiability
        ltl_model.parse_from_string(ltl_model.formula)
        is_satisfiable = ltl_model.check_satisfiability(minimize_automaton=False)

        redundant_cons = check_semantical_redundacy(ltl_formulas, ltl_model)
        
        result = {
            "success": True,
            "redundancy": json.dumps(redundant_cons, indent=2),
            "satisfiable": is_satisfiable,
            "timestamp": datetime.now().isoformat()
        }
        
        return result
            
    except Exception as e:
        return {
            "success": False,
            "error": f"Unexpected error: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }
    
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

def main():
    parser = argparse.ArgumentParser(description='Declare Model Analyzer')
    parser.add_argument(
        '--model',
        type=str,
        required=True,
        help='Path or URL to the Declare model file'
    )
    parser.add_argument(
        '--json-output',
        action='store_true',
        help='Output in JSON format'
    )

    try:
        args = parser.parse_args()
        result = analyze_declare_model(args.model)
        
        if args.json_output:
            print(json.dumps(result, indent=2))
                
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()