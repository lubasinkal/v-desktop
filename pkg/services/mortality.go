package services

import (
	"fmt"
	"sync"

	"github.com/lubasinkal/v-star/pkg/mortality"
	"v-desktop/pkg/models"
)

type MortalityService struct {
	mu     sync.RWMutex
	tables map[string]*mortality.Table
	order  []string
}

func NewMortalityService() *MortalityService {
	return &MortalityService{
		tables: make(map[string]*mortality.Table),
		order:  make([]string, 0),
	}
}

func (s *MortalityService) RegisterTable(name string, table *mortality.Table) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.tables[name]; !ok {
		s.order = append(s.order, name)
	}
	s.tables[name] = table
}

func (s *MortalityService) LoadTableFromFile(name, filepath string) error {
	table, err := mortality.LoadCSV(filepath)
	if err != nil {
		return fmt.Errorf("load table %q from %s: %w", name, filepath, err)
	}
	s.RegisterTable(name, table)
	return nil
}

func (s *MortalityService) GetTableNames() []string {
	s.mu.RLock()
	defer s.mu.RUnlock()
	names := make([]string, len(s.order))
	copy(names, s.order)
	return names
}

func (s *MortalityService) GetTable(name string) (*mortality.Table, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	t, ok := s.tables[name]
	if !ok {
		return nil, fmt.Errorf("table %q not found", name)
	}
	return t, nil
}

func (s *MortalityService) GetTableData(req models.TableDataRequest) (*models.TableDataResponse, error) {
	t, err := s.GetTable(req.Name)
	if err != nil {
		return nil, err
	}
	maxAge := t.MaxAge()
	ages := make([]int, 0, maxAge+1)
	qx := make([]float64, 0, maxAge+1)
	lx := make([]float64, 0, maxAge+1)
	ex := make([]float64, 0, maxAge+1)
	for age := 0; age <= maxAge; age++ {
		ages = append(ages, age)
		qx = append(qx, t.Qx(age))
		lx = append(lx, t.Lx(age))
		ex = append(ex, t.Ex(age))
	}
	return &models.TableDataResponse{
		Name:   req.Name,
		Ages:   ages,
		Qx:     qx,
		Lx:     lx,
		Ex:     ex,
		MaxAge: maxAge,
	}, nil
}

func (s *MortalityService) QueryQx(name string, age int) (float64, error) {
	t, err := s.GetTable(name)
	if err != nil {
		return 0, err
	}
	return t.Qx(age), nil
}

func (s *MortalityService) QueryPx(name string, age, term int) (float64, error) {
	t, err := s.GetTable(name)
	if err != nil {
		return 0, err
	}
	return t.Px(age, term), nil
}

func (s *MortalityService) QueryEx(name string, age int) (float64, error) {
	t, err := s.GetTable(name)
	if err != nil {
		return 0, err
	}
	return t.Ex(age), nil
}
