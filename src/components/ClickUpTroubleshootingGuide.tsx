// src/components/ClickUpTroubleshootingGuide.tsx - Guía de solución de problemas

"use client";

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary
} from '@mui/joy';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  InformationCircleIcon,
  BugIcon,
  ShieldEnergyIcon ,
  Settings01Icon
} from '@hugeicons/core-free-icons';

interface TroubleshootingGuideProps {
  error?: string;
  onDebugClick?: () => void;
  onRetryClick?: () => void;
}

export const ClickUpTroubleshootingGuide: React.FC<TroubleshootingGuideProps> = ({
  error,
  onDebugClick,
  onRetryClick
}) => {
  const [showGuide, setShowGuide] = useState(false);

  const commonIssues = [
    {
      title: "Token de ClickUp inválido",
      description: "El token de API podría estar expirado o ser incorrecto",
      solutions: [
        "Verifica que CLICKUP_API_TOKEN esté configurado en las variables de entorno",
        "Genera un nuevo token en ClickUp Settings → Apps → API Token",
        "Asegúrate de que el token tenga permisos de lectura para usuarios"
      ]
    },
    {
      title: "Usuarios sin ID válido",
      description: "Algunos miembros del team pueden no tener un ID asignado",
      solutions: [
        "Usuarios invitados que no han aceptado la invitación",
        "Miembros desactivados o con estado pendiente",
        "Problemas de sincronización temporal en ClickUp"
      ]
    },
    {
      title: "Permisos insuficientes",
      description: "El token podría no tener acceso a todos los teams o usuarios",
      solutions: [
        "Verifica que tengas permisos de administrador en el workspace",
        "Asegúrate de que el token sea de nivel workspace, no de team",
        "Algunos usuarios podrían estar en teams privados"
      ]
    },
    {
      title: "Problemas de conectividad",
      description: "Problemas de red o límites de rate de la API",
      solutions: [
        "Revisa tu conexión a internet",
        "ClickUp podría estar experimentando problemas (status.clickup.com)",
        "Espera unos minutos antes de reintentar"
      ]
    }
  ];

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="soft" color="danger">
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <HugeiconsIcon icon={BugIcon} size={20} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <Typography level="title-sm">
                  Error al sincronizar usuarios de ClickUp
                </Typography>
                <Typography level="body-sm" className="mt-1">
                  {error}
                </Typography>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {onRetryClick && (
                <Button
                  size="sm"
                  variant="outlined"
                  color="danger"
                  onClick={onRetryClick}
                >
                  Reintentar
                </Button>
              )}
              
              {onDebugClick && (
                <Button
                  size="sm"
                  variant="outlined"
                  color="warning"
                  startDecorator={<HugeiconsIcon icon={BugIcon} size={16} />}
                  onClick={onDebugClick}
                >
                  Debug API
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outlined"
                color="neutral"
                startDecorator={<HugeiconsIcon icon={InformationCircleIcon} size={16} />}
                onClick={() => setShowGuide(!showGuide)}
              >
                {showGuide ? 'Ocultar' : 'Ver'} Guía
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {showGuide && (
        <Card>
          <CardContent>
            <Typography level="title-md" className="mb-3 flex items-center gap-2">
              <HugeiconsIcon icon={ShieldEnergyIcon } size={20} />
              Guía de Solución de Problemas
            </Typography>
            
            <div className="space-y-3">
              {commonIssues.map((issue, index) => (
                <Accordion key={index}>
                  <AccordionSummary>
                    <Typography level="title-sm">
                      {issue.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography level="body-sm" className="mb-2 text-gray-300">
                      {issue.description}
                    </Typography>
                    <ul className="space-y-1 text-sm text-gray-400">
                      {issue.solutions.map((solution, solutionIndex) => (
                        <li key={solutionIndex} className="flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>{solution}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionDetails>
                </Accordion>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
              <Typography level="title-sm" className="mb-2 flex items-center gap-2 text-blue-300">
                <HugeiconsIcon icon={Settings01Icon} size={16} />
                Configuración Recomendada
              </Typography>
              <div className="text-sm text-blue-200 space-y-1">
                <div>• <strong>Token Scope:</strong> Workspace-level API token</div>
                <div>• <strong>Permisos:</strong> Admin o Owner en el workspace</div>
                <div>• <strong>Variables de entorno:</strong> CLICKUP_API_TOKEN correctamente configurado</div>
                <div>• <strong>Network:</strong> Conexión estable a internet</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};