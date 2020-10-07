import React from 'react';
import "./Skill.css";

export type Props = {
  title: string;
  icon: string;
  description: string;
}

export function Skill(props: Props) {
  const {title, icon, description} = props;
  return (
    <div className="skill">
      <img className="skill-icon" src={icon}/>
    </div>
  )
}