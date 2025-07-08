#!/usr/bin/env python3
"""
Production monitoring script for OCR Scanner
"""

import requests
import json
import time
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/ocr-scanner-monitor.log'),
        logging.StreamHandler()
    ]
)

def get_system_stats():
    """Get system statistics"""
    try:
        import psutil
        return {
            'timestamp': datetime.now().isoformat(),
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_percent': psutil.disk_usage('/').percent,
            'load_average': psutil.getloadavg()[0] if hasattr(psutil, 'getloadavg') else None,
            'network': {
                'bytes_sent': psutil.net_io_counters().bytes_sent,
                'bytes_recv': psutil.net_io_counters().bytes_recv
            }
        }
    except ImportError:
        logging.warning("psutil not installed - system stats unavailable")
        return {'timestamp': datetime.now().isoformat(), 'error': 'psutil not available'}

def check_application_health():
    """Check application health"""
    try:
        response = requests.get('http://localhost:5000/health', timeout=5)
        return {
            'status': 'healthy' if response.status_code == 200 else 'unhealthy',
            'response_time': response.elapsed.total_seconds(),
            'status_code': response.status_code,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        return {
            'status': 'unreachable',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }

def check_nginx_status():
    """Check if Nginx is running"""
    try:
        import subprocess
        result = subprocess.run(['systemctl', 'is-active', 'nginx'], 
                              capture_output=True, text=True)
        return {
            'service': 'nginx',
            'status': result.stdout.strip(),
            'active': result.returncode == 0
        }
    except Exception as e:
        return {'service': 'nginx', 'status': 'unknown', 'error': str(e)}

def check_mongodb_status():
    """Check if MongoDB is running"""
    try:
        import subprocess
        result = subprocess.run(['systemctl', 'is-active', 'mongod'], 
                              capture_output=True, text=True)
        return {
            'service': 'mongodb',
            'status': result.stdout.strip(),
            'active': result.returncode == 0
        }
    except Exception as e:
        return {'service': 'mongodb', 'status': 'unknown', 'error': str(e)}

def send_alert(message, alert_type='warning'):
    """Send alert (can be extended to use email, Slack, etc.)"""
    logging.error(f"ALERT [{alert_type.upper()}]: {message}")
    
    # Add your alert mechanism here (email, Slack webhook, etc.)
    # Example: send email or webhook notification

def main():
    """Main monitoring loop"""
    logging.info("Starting OCR Scanner monitoring...")
    
    while True:
        try:
            # Collect all metrics
            stats = {
                'system': get_system_stats(),
                'application': check_application_health(),
                'services': [
                    check_nginx_status(),
                    check_mongodb_status()
                ]
            }
            
            # Save metrics to file
            metrics_file = '/var/log/ocr-scanner-metrics.json'
            with open(metrics_file, 'a') as f:
                f.write(json.dumps(stats) + '\n')
            
            # Check for issues and send alerts
            app_health = stats['application']
            if app_health['status'] != 'healthy':
                send_alert(f"Application unhealthy: {app_health.get('error', 'Unknown error')}")
            
            # Check system resources
            system = stats['system']
            if 'cpu_percent' in system and system['cpu_percent'] > 90:
                send_alert(f"High CPU usage: {system['cpu_percent']}%")
            
            if 'memory_percent' in system and system['memory_percent'] > 90:
                send_alert(f"High memory usage: {system['memory_percent']}%")
            
            if 'disk_percent' in system and system['disk_percent'] > 90:
                send_alert(f"High disk usage: {system['disk_percent']}%")
            
            # Check services
            for service in stats['services']:
                if not service.get('active', False):
                    send_alert(f"Service {service['service']} is not active")
            
            logging.info(f"✅ Monitoring check completed - App: {app_health['status']}")
            
        except Exception as e:
            logging.error(f"Monitoring error: {e}")
        
        # Wait before next check (60 seconds)
        time.sleep(60)

if __name__ == '__main__':
    main()
